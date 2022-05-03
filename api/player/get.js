'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const table = process.env.item_table

module.exports.listPlayer = async (event) => {
  const pId = event.pathParameters.playerId
  const param = {
    ExpressionAttributeValues: {
      ':sk': 'gm-',
      ':pk': pId
    },
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ReturnConsumedCapacity: 'TOTAL',
    TableName: table
  }
  try {
    let consumed = 0
    let items = []
    const games = []
    let playerId = ''; let playerName = ''
    do {
      items = await dynamoDb.query(param).promise()
      const consumedCapacity = items.ConsumedCapacity || {}
      consumed += consumedCapacity.CapacityUnits || 0
      for (const item of items.Items) {
        playerId = item.pk
        playerName = item.pName
        games.push({
          gameId: item.sk,
          gameName: item.gName,
          skill: item.skill,
          status: item.gStatus,
          deleted: item.deleted,
          createdAt: item.createdAt
        })
      }
      param.ExclusiveStartKey = items.LastEvaluatedKey
    } while (typeof items.LastEvaluatedKey !== 'undefined')
    const result = {
      playerName: playerName,
      playerId: playerId,
      games: games
    }
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, result, message.msg.ItemCreatedSuccessed, '', result.length, '', consumed)
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
