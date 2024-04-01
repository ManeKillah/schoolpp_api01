// Initializes the `categories` service on path `/categories`
const { Village } = require('./village.class');
const createModel = require('../../models/village.model');
const hooks = require('./village.hooks');

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
  app.use('/village', new Village(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('village');

  service.hooks(hooks);
};
