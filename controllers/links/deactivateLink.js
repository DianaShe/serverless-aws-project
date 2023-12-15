const linkService = require("../../services/linkService");
const funcWrapper = require("../../utils/funcWrapper");

const deactivateLink = funcWrapper(async (event) => {
  const { linkId } = JSON.parse(event.body);
  const ownerEmail = JSON.parse(
    event.requestContext.authorizer.lambda.stringKey
  );

  await linkService.deleteLink(ownerEmail, [linkId]);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Short link is deactivated" }),
  };
});

module.exports.handler = deactivateLink;
