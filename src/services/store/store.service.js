// Initializes the `categories` service on path `/categories`
const { Store } = require('./store.class');
const createModel = require('../../models/store.model');
const hooks = require('./store.hooks');

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
  app.use('/store', new Store(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('store');

  service.hooks(hooks);
};
