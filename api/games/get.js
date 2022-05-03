'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const table = process.env.item_table

module.exports.listGames = async (event) => {
  const param = {
    ExpressionAttributeValues: {
      ':pk': 'gm-',
      ':sk': 'game'
    },
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk and begins_with(pk, :pk)',
    ReturnConsumedCapacity: 'TOTAL',
    TableName: table
  }
  try {
    let consumed = 0
    let items = []
    const results = []
    do {
      items = await dynamoDb.query(param).promise()
      const consumedCapacity = items.ConsumedCapacity || {}
      consumed += consumedCapacity.CapacityUnits || 0
      for (const item of items.Items) {
        results.push({
          name: item.name,
          description: item.description || '',
          developer: item.developer,
          owner: item.owner,
          platforms: item.platforms,
          initRelease: item.initRelease,
          status: item.status || 1,
          deleted: item.deleted || 0,
          createdAt: item.createdAt
        })
      }
      param.ExclusiveStartKey = items.LastEvaluatedKey
    } while (typeof items.LastEvaluatedKey !== 'undefined')
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, results, message.msg.ItemCreatedSuccessed, '', results.length, '', consumed)
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
