const { Service } = require('feathers-objection');

exports.Observations = class Observations extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model,
    });
  }
};
