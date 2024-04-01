const { FeathersError } = require("@feathersjs/errors");

class customErrors extends FeathersError {
  constructor(name, message, code, className, data) {
    super(
      message || null,
      name || null,
      code || null,
      className || null,
      data || null
    );
  }
}

module.exports = customErrors;
