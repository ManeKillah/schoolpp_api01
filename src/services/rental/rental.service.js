// Initializes the `categories` service on path `/categories`
const { Rental } = require('./rental.class');
const createModel = require('../../models/rental.model');
const hooks = require('./rental.hooks');

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
  app.use('/rental', new Rental(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('rental');

  service.hooks(hooks);
};
