'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const table = process.env.item_table

module.exports.skill = async (event) => {
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)
  const pId = event.pathParameters.playerId
  const gId = event.pathParameters.gameId
  const param = {
    TableName: table,
    Key: {
      pk: pId,
      sk: gId
    },
    ExpressionAttributeValues: {
      ':skill': data.skill,
      ':updateSkillAt': timestamp
    },
    ExpressionAttributeNames: {
      '#skill': 'skill',
      '#updateSkillAt': 'updateSkillAt'
    },
    UpdateExpression: 'set #skill = :skill, #updateSkillAt = :updateSkillAt',
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const result = await dynamoDb.update(param).promise()
    console.log('result', result)
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, [], message.msg.ItemCreatedSuccessed, '', 1)
    }
  } catch (err) {
    return {
      statusCode: code.httpStatus.BadRequest,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.ItemCreatedFailed, err, 0)
    }
  }
}
