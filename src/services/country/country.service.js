// Initializes the `categories` service on path `/categories`
const { Country } = require('./country.class');
const createModel = require('../../models/country.model');
const hooks = require('./country.hooks');

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
  app.use('/country', new Country(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('country');

  service.hooks(hooks);
};
