import AWS from 'aws-sdk';
import commonMiddleware from './lib/commonMiddleware';
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import validator from "@middy/validator";
import placeBidSchema from './lib/schemas/placeBidSchema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`);
  }
  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden('Your cannot bid on closed Auctions');
  }
  if (auction.seller === email) {
    throw new createError.Forbidden(`You shouldn't bid on your own Auctions`);
  }
  if (auction.highestBid.bidder === email) {
    throw new createError.Forbidden(`You're already the highest bidder, you can't increase your bid`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedAuction;

  try {
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };

}

export const handler = commonMiddleware(placeBid).use(validator({
  inputSchema: placeBidSchema
}));