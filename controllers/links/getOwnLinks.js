const linkService = require("../../services/linkService");
const funcWrapper = require("../../utils/funcWrapper");

const getOwnLinks = funcWrapper(async (event) => {
  const ownerEmail = JSON.parse(
    event.requestContext.authorizer.lambda.stringKey
  );

  const result = await linkService.getAllLinks(ownerEmail);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

module.exports.handler = getOwnLinks;
