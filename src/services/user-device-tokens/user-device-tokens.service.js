// Initializes the `shops` service on path `/shops`
const { UserDeviceTokens } = require('./user-device-tokens.class');
const createModel = require('../../models/user-device-tokens.model');
const hooks = require('./user-device-tokens.hooks');

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
  app.use('/user-device-tokens', new UserDeviceTokens(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-device-tokens');

  service.hooks(hooks);
};
