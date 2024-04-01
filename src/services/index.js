const users = require('./users/users.service.js');

const meilisearch = require('./meilisearch/meilisearch.service.js');
const userDeviceTokens = require('./user-device-tokens/user-device-tokens.service.js');

const rental = require('./rental/rental.service.js');
const store = require('./store/store.service.js');
const cities = require('./city/city.service.js');
const country = require('./country/country.service.js');
const village = require('./village/village.service.js');
const observations = require('./observations/observations.service.js');
const operations = require('./operations/operations.service.js');
const container = require('./container/container.service.js');
const equipment = require('./equipment/equipment.service.js');
const project = require('./project/project.service.js');
const fileImage = require('./file-image/file-image.service.js');
const sendNotifications = require('./send-notifications/send-notifications.service.js');

module.exports = function (app) {
  app.configure(users);

  app.configure(meilisearch);
  app.configure(sendNotifications);
  app.configure(fileImage);

  app.configure(userDeviceTokens);
  app.configure(rental);
  app.configure(store);
  app.configure(cities);
  app.configure(country);
  app.configure(village);
  app.configure(observations);
  app.configure(operations);
  app.configure(container);
  app.configure(project);
  app.configure(equipment);
};
