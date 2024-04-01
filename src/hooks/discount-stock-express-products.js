// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    let records = getItems(context);

    const { user } = context.params;

    const productsDiscount = await context.app
      .service("express-products-orders-details")
      .getModel()
      .query()
      .where({ express_product_order_id: options.express_product_order_id })
      .then(it =>
        it.map(it => ({
          product_id: it.express_product_id,
          quantity: it.quantity
        }))
      );

    for (let index = 0; index < productsDiscount.length; index++) {
      await context.app
        .service("express-products")
        .getModel()
        .query()
        .where("id", "=", productsDiscount[index].product_id)
        // .andWhere(function () {
        //   this.where('is_ead', null).orWhere('is_ead', 0)
        // })
        .decrement("quantity", productsDiscount[index].quantity);
    }

    replaceItems(context, records);

    return context;
  };
};
