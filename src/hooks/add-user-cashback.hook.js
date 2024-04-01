const moment = require('moment');
const getProductsCashback = require('./get-products-cashback');

module.exports = function (orderId) {
  return async (context) => {
    const configurationCashback = await context.app
      .service('configuration-cashback')
      .getModel()
      .query()
      .where({
        id: 1,
      })
      .first();

    const ordersModel = context.app.service('orders').getModel();
    const orderDetailsModel = context.app.service('orders-details').getModel();
    const usersModel = context.app.service('users').getModel();
    const walletMovementsModel = context.app
      .service('wallet-movements')
      .getModel();

    const [order, orderDetails] = await Promise.all([
      ordersModel
        .query()
        .where({
          id: orderId,
        })
        .first(),
      orderDetailsModel
        .query()
        .select(
          'products.id',
          'orders_details.quantity',
          'products.cashback_status',
          'products.cashback_specific_percentage'
        )
        .innerJoin('products', 'orders_details.product_id', '=', 'products.id')
        .where({
          order_id: orderId,
        }),
    ]);

    if (!order) return context;

    const userBuyer = await usersModel
      .query()
      .where({
        id: order.user_id,
      })
      .first();

    if (!userBuyer) return context;

    const { cashback, cashback_amount } = await getProductsCashback(
      orderDetails
    )(userBuyer)(context);

    if (!cashback) return context;

    await Promise.all([
      walletMovementsModel.create({
        user_id: userBuyer.id,
        type: 'cashback',
        amount_net: cashback_amount,
        description: `Cashback por compra #${order.id}`,
        created_by_user_id: userBuyer.id,
        expired_day: moment().add(
          +configurationCashback.bonus_cashback_expiration_days,
          'days'
        ),
        expired_status: 'waiting',
      }),
      ordersModel
        .query()
        .patch({
          cashback_amount,
        })
        .where({
          id: order.id,
        }),
    ]);

    return context;
  };
};
