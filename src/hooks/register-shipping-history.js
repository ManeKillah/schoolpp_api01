// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { NotAcceptable } = require("@feathersjs/errors");
const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    const { user } = context.params;

    await context.app.service("shipping-history").getModel().query().insert({
      shipping_id: options.shipping_id,
      shipping_status_id: options.shipping_status_id,
      user_id: options.user_id,
    });

    replaceItems(context, records);

    return context;
  };
};
