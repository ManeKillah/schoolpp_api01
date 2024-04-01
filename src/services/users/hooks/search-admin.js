// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const {
  checkContext,
  getItems,
  replaceItems,
} = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  // Return the actual hook.
  return async (context) => {
    // Throw if the hook is being called from an unexpected location.
    checkContext(context, null, [
      "find",
      "get",
      "create",
      "update",
      "patch",
      "remove",
    ]);

    // Get the authenticated user.
    // eslint-disable-next-line no-unused-vars
    const { user } = context.params;
    // Get the record(s) from context.data (before), context.result.data or context.result (after).
    // getItems always returns an array to simplify your processing.
    const records = getItems(context);

    if (context.params.query.data_value && user.role == "admin") {
      const value = context.params.query.data_value;
      delete context.params.query.data_value;

      const ordersIds = await context.app
        .service("users")
        .getModel()
        .query()
        .select("users.id")
        .orWhere("last_name", "LIKE", `%${value}%`)
        .orWhere("first_name", "LIKE", `%${value}%`)
        .orWhere("email", "LIKE", `%${value}%`)
        .orWhere("phone", "LIKE", `%${value}%`)
        .orWhere("dni", "LIKE", `%${value}%`)
        .where({ deletedAt: null })
        .then((it) => it.map((it) => it.id));

      context.params.query = { id: { $in: ordersIds }, deletedAt: null };
    }

    // Place the modified records back in the context.
    replaceItems(context, records);
    // Best practice: hooks should always return the context.
    return context;
  };
};

// Throw on unrecoverable error.
// eslint-disable-next-line no-unused-vars
function error(msg) {
  throw new Error(msg);
}
