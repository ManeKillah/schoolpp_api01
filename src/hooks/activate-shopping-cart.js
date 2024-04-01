// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const {
  checkContext,
  getItems,
  replaceItems,
} = require('feathers-hooks-common');
const { NotAcceptable, NotFound, PaymentError } = require('@feathersjs/errors');
const moment = require('moment');
// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  // Return the actual hook.
  return async (context) => {
    checkContext(context, null, ['create']);

    const { user } = context.params;

    const records = getItems(context);

    const order = await context.app
      .service('orders')
      .getModel()
      .query()
      .select('shopping_cart_id', 'user_id')
      .where({ id: options.order_id })
      .then((it) => it[0]);

    const shoppingCar = await context.app
      .service('shopping-cart')
      .getModel()
      .query()
      .where({
        user_id: order.user_id,
        status: 'active',
        deletedAt: null,
      })
      .then((it) => it[0]);

    if (!shoppingCar) {
      await context.app
        .service('shopping-cart')
        .getModel()
        .query()
        .patch({ status: 'active' })
        .where({ id: order.shopping_cart_id });
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
