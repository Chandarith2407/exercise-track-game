'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const table = process.env.item_table

module.exports.create = async (event) => {
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)
  let head = ''; let createdAt = timestamp
  /* todo: check is update or not */
  if (data.id === undefined || data.id === '') {
    head = 'gm-' + uuid.v1()
  } else {
    head = data.id
    createdAt = data.createdAt
  }
  const params = {
    TableName: table,
    Item: {
      pk: head,
      sk: 'game',
      name: data.name,
      description: data.description || '',
      developer: data.developer,
      owner: data.owner,
      platforms: data.platforms,
      initRelease: data.initRelease,
      status: data.status || 1,
      deleted: data.deleted || 0,
      createdAt: createdAt,
      updatedAt: timestamp
    }
  }
  try {
    await dynamoDb.put(params).promise()
    const response = {
      id: head,
      name: data.name,
      description: data.description,
      developer: data.developer,
      owner: data.owner,
      platforms: data.platforms,
      initRelease: data.initRelease,
      status: data.status || 1,
      deleted: data.deleted || 0,
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
