// Initializes the `categories` service on path `/categories`
const { Project } = require('./project.class');
const createModel = require('../../models/project.model');
const hooks = require('./project.hooks');

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
  app.use('/project', new Project(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('project');

  service.hooks(hooks);
};
