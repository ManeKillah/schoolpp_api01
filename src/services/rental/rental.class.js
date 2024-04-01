const { Service } = require('feathers-objection');

exports.Rental = class Rental extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model,
    });
  }
};
