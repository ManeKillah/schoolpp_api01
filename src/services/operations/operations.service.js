// Initializes the `categories` service on path `/categories`
const { Operations } = require('./operations.class');
const createModel = require('../../models/operation.model');
const hooks = require('./operations.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: {
      max: 5000,
      default: 100,
    },
    whitelist: ['$eager', '$joinRelation'],
    // allowedEager: '[user-device-tokens]',
    // allowedUpsert: ['user_device_tokens']
  };

  // Initialize our service with any options it requires
  app.use('/operations', new Operations(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('operations');

  service.hooks(hooks);
};
