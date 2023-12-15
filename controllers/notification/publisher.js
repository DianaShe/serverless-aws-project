const { sqs } = require ("../../index");
const HttpError = require("../../utils/httpError");

const QUEUE_URL = process.env.QUEUE_URL;

const publisher = async (email, linkIds) => {
  try {
    await sqs
      .sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({
          linkIds,
          email,
        }),
      })
      .promise();
  } catch (error) {
    throw HttpError(400, "Something went wrong. Please, try again later");
  }
};

module.exports.handler = publisher