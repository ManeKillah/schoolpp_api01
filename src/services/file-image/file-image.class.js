const { Service } = require('feathers-objection');

exports.FileImage = class FileImage extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model,
    });
  }
};
