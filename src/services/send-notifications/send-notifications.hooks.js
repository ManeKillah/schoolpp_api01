// const sendNotificationsBC = require("./hooks/send-notifications-b-c");
const sendEmail = require('./hooks/sendEmail');
const sendSms = require('./hooks/sendSms');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [sendEmail(), sendSms()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
