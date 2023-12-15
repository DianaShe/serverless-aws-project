const SQS = require ("aws-sdk/clients/sqs");
const SES = require ("aws-sdk/clients/ses");

const sqs = new SQS();
const ses = new SES();

export { sqs, ses };
