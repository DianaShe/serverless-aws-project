const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

module.exports = dynamoDbClient