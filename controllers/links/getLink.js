const HttpError = require("../../utils/httpError");
const linkService = require("../../services/linkService");
const funcWrapper = require("../../utils/funcWrapper");

const getLink = funcWrapper(async (event) => {
  const linkId = event.pathParameters?.linkId ?? "";
  const ownerEmail = JSON.parse(
    event.requestContext.authorizer.lambda.stringKey
  );

  if (!linkId) {
    throw HttpError(400, "Short link id is missing");
  }

  const result = await linkService.redirectLink(linkId, ownerEmail);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

module.exports.handler = getLink;
