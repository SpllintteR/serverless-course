import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function updateAuctionPicture(id, pictureUrl) {

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set pictureUrl = :pictureUrl',
        ExpressionAttributeValues: {
          ':pictureUrl': pictureUrl
        },
        ReturnValues: 'ALL_NEW'
      };

      try {
        const result = await dynamoDB.update(params).promise();
        return result.Attributes;
      } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
      }
}