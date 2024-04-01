// Initializes the `categories` service on path `/categories`
const { Observations } = require('./observations.class');
const createModel = require('../../models/observations.model');
const hooks = require('./observations.hooks');

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
  app.use('/observations', new Observations(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('observations');

  service.hooks(hooks);
};
