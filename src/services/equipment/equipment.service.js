// Initializes the `categories` service on path `/categories`
const { Equipment } = require('./equipment.class');
const createModel = require('../../models/equipment.model');
const hooks = require('./equipment.hooks');

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
  app.use('/equipment', new Equipment(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('equipment');

  service.hooks(hooks);
};
