
const SES = require ("aws-sdk/clients/ses");


const ses = new SES();

export { sqs, ses };
