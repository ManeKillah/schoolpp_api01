// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { getItems, replaceItems } = require("feathers-hooks-common");
const AddressesModel = require("../models/addresses.model");
const { NotAcceptable } = require("@feathersjs/errors");
const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    let valid = null;

    switch (context.path) {
      case "users-addresses":
        if (!records.state_name)
          throw new NotAcceptable("Debes enviar el nombre del estado.");

        if (!records.city_name)
          throw new NotAcceptable("Debes enviar el nombre de la ciudad.");

        valid = ajv.validate(AddressesModel().jsonSchema, records);
        break;

      default:
        break;
    }

    if (!valid) {
      throw new NotAcceptable(ajv.errors);
    }

    replaceItems(context, records);

    return context;
  };
};
