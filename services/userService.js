const dynamoDbClient = require("../utils/db");
const {
  GetCommand,
  UpdateCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = process.env.USERS_TABLE;

class UserService {
  async addUser(email, userId, accessToken, password) {
    const params = {
      TableName: USERS_TABLE,
      Item: {
        email,
        userId,
        password,
        accessToken,
      },
    };

    await dynamoDbClient.send(new PutCommand(params));
    return JSON.stringify({ userId, accessToken });
  }

  async findUser(email) {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        email,
      },
    };

    const result = await dynamoDbClient.send(new GetCommand(params));

    return result.Item;
  }

  async updateToken(email, accessToken) {
    const updateParams = {
      TableName: USERS_TABLE,
      Key: {
        email,
      },
      UpdateExpression: "set accessToken = :token",
      ExpressionAttributeValues: {
        ":token": accessToken,
      },
      ReturnValues: "ALL_NEW",
    };

    await dynamoDbClient.send(new UpdateCommand(updateParams));
  }
}

module.exports = new UserService();
