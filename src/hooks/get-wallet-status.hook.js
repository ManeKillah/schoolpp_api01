const { getProductPrices } = require("../utils/price-list/prices");
const { getTotalOrderProducts } = require("../utils/products");

module.exports = function ({
  userId,
  products = []
}) {
  return async function (context) {
    const response = {
      message: '',
      wallet: false,
    };

    // Verificar que hay productos
    if (!products?.length) {
      response.message =
        'Debes agregar productos al carrito';

      return response;
    }

    const walletConfiguration = await context.app
      .service('configurations')
      .getModel()
      .query()
      .select('key', 'value')
      .whereIn('key', [
        'wallet_first_purchase_min_amount',
        'wallet_next_purchases_min_amount',
      ])
      .then((res) =>
        res.reduce((acc, it) => ({ ...acc, [it.key]: it.value }), {})
      );

    const usersModel = context.app.service('users').getModel();

    const [user] = await Promise.all([
      usersModel
        .query()
        .select('id', 'first_purchase_with_wallet_status')
        .where({
          id: userId,
        })
        .first(),
    ]);

    const productsPrices = await getProductPrices(user)(
      products.map(({ id, product_id }) => id || product_id)
    )(context).then((res) =>
      res.reduce((acc, it) => ({ ...acc, [it.product_id]: it }), {})
    );

    const totalOrderProducts = getTotalOrderProducts(
      products.map((product) => ({
        id: product.id,
        ...productsPrices[product.id],
        quantity: product.quantity,
      }))
    );


    if (user.first_purchase_with_wallet_status === 'pending') {
      if (totalOrderProducts < +walletConfiguration.wallet_first_purchase_min_amount) {
        response.message = `La compra mínima para primera vez con wallet debe ser superior a ${new Intl.NumberFormat(
          'es-CO',
          {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }
        ).format(+walletConfiguration.wallet_first_purchase_min_amount)}`;
        return response;
      }
    } else {
      if (totalOrderProducts < +walletConfiguration.wallet_next_purchases_min_amount) {
        response.message = `La compra mínima para pago con wallet debe ser superior a ${new Intl.NumberFormat(
          'es-CO',
          {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }
        ).format(+walletConfiguration.wallet_next_purchases_min_amount)}`;
        return response;
      }
    }

    response.wallet = true;

    return response;
  };
};
