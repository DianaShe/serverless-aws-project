const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqs = new SQSClient();
const HttpError = require("../../utils/httpError");

const QUEUE_URL = process.env.QUEUE_URL || "";

const publisher = async (emailTo, linkIds) => {
  try {
    await sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({
          linkIds,
          emailTo,
        }),
      }));
  } catch (error) {
    throw HttpError(400, "Something went wrong. Please, try again later");
  }
};

module.exports.handler = publisher