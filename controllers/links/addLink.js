const linkService = require("../../services/linkService");
const funcWrapper = require("../../utils/funcWrapper");
const HttpError = require("../../utils/httpError");

const addLink = funcWrapper(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { url, expiresIn } = body;

  if (!url || !expiresIn) {
    throw HttpError(400, "Please, provive correct URL and expiration period");
  }

  const validUrl = url.startsWith("http");

  if (!validUrl) {
    throw HttpError(400, "There should be a valid URL");
  }

  const ownerEmail = JSON.parse(
    event.requestContext.authorizer.lambda.stringKey
  );

  const result = await linkService.addLink(url, expiresIn, ownerEmail);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

module.exports.handler = addLink;
