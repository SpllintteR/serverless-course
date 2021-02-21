import AWS from 'aws-sdk';
import commonMiddleware from './lib/commonMiddleware';
import createError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;

  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndingAt',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
        '#status': 'status'
    }
  };

  try {
      const result = await dynamoDB
        .query(params)
        .promise();
      auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions);