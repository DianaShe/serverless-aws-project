const linkService = require("../../services/linkService");

const expireLinks = async () => {
  const links = await linkService.getExpiredLinks();

  if (links && links.length) {
    const linksSortedByEmail = links.reduce((acc, item) => {
      if (!acc[item.ownerEmail]) {
        acc[item.ownerEmail] = [];
      }
      acc[item.ownerEmail].push(item.linkId);
      return acc;
    }, {});

    for (const email in linksSortedByEmail) {
      await linkService.deleteLink(email, linksSortedByEmail[email]);
    }
  }
};

module.exports.handler = expireLinks;
