const {ses} = require("../../index")

const emailNotification = require ("../../constants/emailNotification");
const HttpError = require ("../../utils/httpError");



const worker = async (event) => {
  const sourceUrl = process.env.SENDER_EMAIL;

  if (!sourceUrl) {
    throw HttpError(400, "SENDER_EMAIL is not defined in environment variables.");
  }

  for (const message of event.Records) {
    const bodyData = JSON.parse(message.body);
    const { email, linkIds } = bodyData;

    const emailBody = emailNotification(linkIds);

    const params = {
      Source: sourceUrl,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Short Link Expiration Notification" },
        Body: {
          Html: {
            Data: emailBody,
          },
        },
      },
    };

    try {
      await ses.sendEmail(params).promise();
    } catch (error) {
      throw HttpError(400, "Error sending email");
    }
  }
};

module.exports.handler = worker