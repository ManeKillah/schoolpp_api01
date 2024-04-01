// Initializes the `categories` service on path `/categories`
const { FileImage } = require('./file-image.class');
const createModel = require('../../models/file-image.model');
const hooks = require('./file-image.hooks');
const blobService = require('feathers-blob');
// Here we initialize a FileSystem storage,
// but you can use feathers-blob with any other
// storage service like AWS or Google Drive.
const fs = require('fs-blob-store');

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
  app.use('/file-image', new FileImage(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('file-image');

  service.hooks(hooks);
};
