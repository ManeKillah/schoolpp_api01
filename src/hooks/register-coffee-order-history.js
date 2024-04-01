// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { NotAcceptable } = require("@feathersjs/errors");
const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    const { user } = context.params;

    await context.app
      .service("coffee-orders-history")
      .getModel()
      .query()
      .insert({
        coffee_order_id: options.coffee_order_id,
        order_status_id: options.order_status_id,
        user_id: options.user_id ? options.user_id : user ? user.id : 1,
      });

    replaceItems(context, records);

    return context;
  };
};
