import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
            id: auction.id
        },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };

    await dynamodb.update(params).promise();
    const { title, seller, highestBid } = auction;
    const { amount, bidder } = highestBid;

    const notifySeller = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject:"Your Item has been sold",
            body:`Item ${title} has been sold for ${amount}`,
            recipient: seller})
    }).promise();

    const notifyBidder = sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject:"Your bid won the auction",
            body:`Your bid of ${amount} on the Item ${title} is the highest, congratulations`,
            recipient: bidder})
    }).promise();

    return Promise.all([notifySeller, notifyBidder]);
}