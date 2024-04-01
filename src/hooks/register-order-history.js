// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { NotAcceptable } = require('@feathersjs/errors');
const { getItems, replaceItems } = require('feathers-hooks-common');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    const { user } = context.params;

    await context.app
      .service('order-history')
      .getModel()
      .query()
      .insert({
        order_id: options.order_id,
        order_status_id: options.order_status_id,
        user_id: user ? user.id : options.user_id,
        // company_id: options.company_id,
      });

    replaceItems(context, records);

    return context;
  };
};
