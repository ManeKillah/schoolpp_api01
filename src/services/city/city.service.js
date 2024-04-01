// Initializes the `categories` service on path `/categories`
const { City } = require('./city.class');
const createModel = require('../../models/city.model');
const hooks = require('./city.hooks');

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
  app.use('/city', new City(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('city');

  service.hooks(hooks);
};
