function getUserOrdersWithCashbackToday(userId) {
  return async function (context) {
    const knex = context.app.get('knex');

    return await context.app
      .service('orders')
      .getModel()
      .query()
      .whereIn('order_status_id', [3, 5, 6, 7, 8, 9])
      .where('cashback_amount', '>', 0)
      .where({
        deletedAt: null,
        user_id: userId,
      })
      .where(knex.raw('date(createdAt) = CURDATE()'));
  };
}

function getProductCashback(product) {
  return function ({ cashback_type, cashback_value }) {
    if (product.cashback_status === 'specific') {
      return (
        product.price *
        (product.quantity || 1) *
        (product.cashback_specific_percentage / 100)
      );
    } else if (product.cashback_status === 'global') {
      if (cashback_type === 'product_percentage') {
        return product.price * (product.quantity || 1) * (cashback_value / 100);
      }
    }

    return 0;
  };
}

function getProductsTotalCashback(products) {
  return function (globalPercentageCashback) {
    return products.reduce(
      (total, product) =>
        total + getProductCashback(product)(globalPercentageCashback),
      0
    );
  };
}

module.exports = {
  getUserOrdersWithCashbackToday,
  getProductCashback,
  getProductsTotalCashback,
};
