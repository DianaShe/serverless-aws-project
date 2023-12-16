const dynamoDbClient = require("../utils/db");
const {
  GetCommand,
  UpdateCommand,
  PutCommand,
  ScanCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require("nanoid");
const HttpError = require("../utils/httpError");

const EXP_PERIOD = require("../constants/expirationPeriod");
const { handler: publisherHandler } = require("../controllers/notification/publisher");

const LINKS_TABLE = process.env.LINKS_TABLE;
const BASE = process.env.BASE;

class LinkService {
  calculateExpiration(period) {
    if (period === "one-time") {
      return period;
    }

    const currentTime = Date.now();
    const expiresIn = EXP_PERIOD[period];

    if (!expiresIn) {
      throw HttpError(400, `Invalid period value: ${period}`);
    }

    return new Date(currentTime + expiresIn).toString();
  }

  async findLinkById(linkId, ownerEmail) {
    const params = {
      TableName: LINKS_TABLE,
      Key: { linkId, ownerEmail },
    };

    return await dynamoDbClient.send(new GetCommand(params));
  }

  async updateStats(linkId, ownerEmail) {
    const existingLink = await this.findLinkById(linkId, ownerEmail);

    if (!existingLink.Item) {
      throw HttpError(404, "URL not found");
    }

    const updateParams = {
      TableName: LINKS_TABLE,
      Key: { linkId, ownerEmail },
      UpdateExpression: "SET #stats = if_not_exists(#stats, :zero) + :one",
      ExpressionAttributeNames: {
        "#stats": "stats",
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ":one": 1,
      },
      ReturnValues: "ALL_NEW",
    };

    return await dynamoDbClient.send(new UpdateCommand(updateParams));
  }

  async addLink(fullUrl, period, ownerEmail) {
    const shortUrl = BASE + nanoid(6);
    const linkId = nanoid(6);
    const expiresIn = this.calculateExpiration(period);

    const params = {
      TableName: LINKS_TABLE,
      Item: {
        shortUrl,
        fullUrl,
        linkId,
        expiresIn,
        ownerEmail,
      },
    };

    await dynamoDbClient.send(new PutCommand(params));

    

    return {
      shortUrl,
      fullUrl,
      linkId,
      expiresIn,
    };
  }

  async deleteLink(ownerEmail, linkIds) {
    await publisherHandler (ownerEmail, linkIds);

    const deleteRequests = linkIds.map((id) => {
      return {
        DeleteRequest: {
          Key: { linkId: id, ownerEmail },
        },
      };
    });

    const params = {
      RequestItems: {
        "links-table": deleteRequests,
      },
    };

    await dynamoDbClient.send(new BatchWriteCommand(params));

    return linkIds.map((id) => ({ id, ownerEmail }));
  }

  async getExpiredLinks() {
    const currentTime = Date.now();
    const params = {
      TableName: LINKS_TABLE,
    };

    const data = await dynamoDbClient.send(new ScanCommand(params));

    const expired = data.Items.filter((item) => {
      const expiresIn = new Date(item.expiresIn).getTime();

      return currentTime > expiresIn && item.expiresIn !== "one-time";
    });

    return expired;
  }

  async getAllLinks(ownerEmail) {
    const params = {
      TableName: LINKS_TABLE,
      FilterExpression: "ownerEmail = :ow",
      ExpressionAttributeValues: {
        ":ow": ownerEmail,
      },
    };

    const { Items } = await dynamoDbClient.send(new ScanCommand(params));
    if (!Items?.length) {
      throw HttpError(404, "You do not have saved short urls yet");
    }

    return Items.map((item) => {
      return {
        id: item.linkId,
        fullUrl: item.fullUrl,
        shortUrl: item.shortUrl,
        expiresIn: item.expiresIn,
      };
    });
  }

  async redirectLink(linkId, ownerEmail) {
    const updatedLink = await this.updateStats(linkId, ownerEmail);

    if (!updatedLink.Attributes) {
      throw HttpError(404, "Not found");
    }
    const { fullUrl, expiresIn, stats } = updatedLink.Attributes;
    const expiration = JSON.parse(expiresIn);

    if (expiration === "one-time") {
      await this.deleteLink(ownerEmail, [linkId]);
      return {
        fullUrl,
        expiresIn,
      };
    }

    return {
      fullUrl,
      expiresIn,
      stats,
    };
  }
}

module.exports = new LinkService();
