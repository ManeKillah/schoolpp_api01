const { Service } = require('feathers-objection');

exports.Project = class Project extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model,
    });
  }
};
