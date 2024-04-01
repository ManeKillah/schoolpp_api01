const { Service } = require('feathers-objection');

exports.UserDeviceTokens = class UserDeviceTokens extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model,
    });
  }
};
