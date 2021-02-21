import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
    const now = new Date();
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndingAt',
        KeyConditionExpression: '#status = :status and endingAt <= :endingAt',
        ExpressionAttributeValues: {
          ':status': 'OPEN',
          ':endingAt': now.toISOString()
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
      };

      const result = await dynamodb.query(params).promise();
      return result.Items;
}