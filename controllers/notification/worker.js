const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses")

const emailNotification = require ("../../constants/emailNotification");
const HttpError = require ("../../utils/httpError");

const ses = new SESClient()


const worker = async (event) => {
  const sourceEmail = process.env.SENDER_EMAIL;

  if (!sourceEmail) {
    throw HttpError(400, "SENDER_EMAIL is not defined.");
  }

  for (const message of event.Records) {
    const bodyData = JSON.parse(message.body);
    const { emailTo, linkIds } = bodyData;

    const emailText = emailNotification(linkIds);

    const params = {
      Source: sourceEmail,
      Destination: { ToAddresses: [emailTo] },
      Message: {
        Subject: { Data: "Short Link Expiration Notification" },
        Body: {
          Html: {
            Data: emailText,
          },
        },
      },
    };

    try {
      await ses.send(SendEmailCommand(params));
    } catch (error) {
      throw HttpError(400, "Error sending email");
    }
  }
};

module.exports.handler = worker