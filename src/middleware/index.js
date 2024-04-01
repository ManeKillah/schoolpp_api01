const awsS3Middleware = require('./aws-s3-middleware');
const getIp = require('./getIp');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  // Add your custom middleware here. Remember that
  app.use('/s3Client', awsS3Middleware());
  app.use('/process-order-payments', getIp());
  // in Express, the order matters.
};
