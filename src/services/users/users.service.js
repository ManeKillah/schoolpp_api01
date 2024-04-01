// Initializes the `users` service on path `/users`
const { Users } = require("./users.class");
const createModel = require("../../models/users.model");
const hooks = require("./users.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: {
      max: 5000,
      default: 100,
    },
    whitelist: ["$eager", "$joinRelation"],
    allowedEager: "[user-device-tokens]",
    // allowedUpsert: ['user_device_tokens']
  };

  // Initialize our service with any options it requires
  app.use("/users", new Users(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("users");

  service.hooks(hooks);
};
