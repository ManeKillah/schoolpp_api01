// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { NotAcceptable } = require("@feathersjs/errors");
const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    const { user } = context.params;

    if (context.path == "users" && context.method == "create") {
      const email = await context.app
        .service("users")
        .getModel()
        .query()
        .where({ email: records.email })
        .then((it) => it[0]);

      if (email)
        throw new NotAcceptable("El email ya se encuentra registrado.");
    }
    replaceItems(context, records);

    return context;
  };
};
