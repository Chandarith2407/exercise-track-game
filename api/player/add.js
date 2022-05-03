'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const table = process.env.item_table

module.exports.register = async (event) => {
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)
  let head = ''; let createdAt = timestamp
  const params = []
  /* todo: check is update or not */
  if (data.id === undefined || data.id === '') {
    head = 'ply-' + uuid.v1()
    params.push({
      PutRequest: {
        Item: {
          pk: head,
          sk: 'player',
          name: data.name,
          gender: data.gender,
          age: data.age || 0,
          nickname: data.nickname || '',
          email: data.email,
          nationality: data.nationality || '',
          profile: data.profile || '',
          deleted: data.deleted || 0,
          status: data.status || 1,
          createdAt: createdAt,
          updatedAt: timestamp
        }
      }
    })
  } else {
    head = data.id
    createdAt = data.createdAt
  }
  params.push({
    PutRequest: {
      Item: {
        pk: head,
        sk: data.gId,
        pName: data.name,
        gName: data.gName,
        status: data.gStatus,
        deleted: data.deleted || 0,
        createdAt: createdAt,
        updatedAt: timestamp
      }
    }
  })
  try {
    await dynamoDb.batchWrite({ RequestItems: { [table]: params } }).promise()
    const response = {
      id: head,
      gameId: data.gId,
      pName: data.name,
      gName: data.gName,
      createdAt: createdAt
    }
    return {
      statusCode: code.httpStatus.Created,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.Created, response, message.msg.ItemCreatedSuccessed, '', 1)
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
