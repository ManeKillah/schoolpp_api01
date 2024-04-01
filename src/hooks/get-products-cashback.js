const {
  getUserOrdersWithCashbackToday,
  getProductsTotalCashback,
} = require('../utils/cashback');
const { getProductPrices } = require('../utils/price-list/prices');
const { getTotalOrderProducts, getProductPrice } = require('../utils/products');

module.exports = function (products) {
  return function (user) {
    return async function (context) {
      const response = {
        cashback: false,
        message: '',
        cashback_amount: 0,
      };

      if (!user) return context;

      // Verificar que hay productos
      if (!products?.length) {
        response.message =
          'Agregar productos al carrito para conocer el cashback.';

        return response;
      }

      const configurationCashback = await context.app
        .service('configuration-cashback')
        .getModel()
        .query()
        .where({
          id: 1,
        })
        .first();

      // Verificar que el cashback este activo
      if (configurationCashback.cashback_status === 'inactive') {
        response.message = 'Por el momento no tenemos cashback activo.';
        return response;
      }

      // Verificar que no exista otra orden con cashback en el día
      const userOrderWithCashbackToday = await getUserOrdersWithCashbackToday(
        user.id
      )(context);
      if (userOrderWithCashbackToday.length) {
        response.message =
          'Esta compra no es elegible para el cashback, ya que ya hemos proporcionado cashback en otra orden hoy. Por favor, regresa mañana, y entonces podrás obtenerlo.';
        return response;
      }

      // Verificar monto mínimo para cashback
      const productsPrices = await getProductPrices(user)(
        products.map(({ id, product_id }) => id || product_id)
      )(context).then((res) =>
        res.reduce((acc, it) => ({ ...acc, [it.product_id]: it }), {})
      );

      const totalOrderProducts = getTotalOrderProducts(
        products
          .map((product) => ({
            id: product.id,
            ...productsPrices[product.id],
            quantity: product.quantity,
          }))
          // Eliminar productos en descuento
          .filter((product) => {
            if (
              configurationCashback.cashback_apply_to_offer_products === 'true'
            )
              return true;

            return !product.discount_price && !product.discount_price_whit_tax;
          })
      );
      if (totalOrderProducts < +configurationCashback.order_min_amount) {
        const missingAmount =
          +configurationCashback.order_min_amount - totalOrderProducts;

        response.message = `Te hacen falta ${new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }).format(missingAmount)} para obtener cashback.`;

        return response;
      }
      // Calculamos el cashback
      const productsCashback =
        configurationCashback.cashback_type === 'fixed_order_amount'
          ? +configurationCashback.cashback_value
          : getProductsTotalCashback(
              products.map((product) => ({
                id: product.id,
                price: getProductPrice(productsPrices[product.id]),
                quantity: product.quantity,
                cashback_status: product.cashback_status,
                cashback_specific_percentage:
                  product.cashback_specific_percentage,
              }))
            )({
              cashback_type: configurationCashback.cashback_type,
              cashback_value: +configurationCashback.cashback_value,
            });
      const maxCashbackAmount = +configurationCashback.cashback_max_amount;
      const finalCashbackAmount =
        productsCashback < maxCashbackAmount
          ? productsCashback
          : maxCashbackAmount;

      response.message = `En esta compra obtendrás un cashback de ${new Intl.NumberFormat(
        'es-CO',
        {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
        }
      ).format(finalCashbackAmount)}`;
      response.cashback = true;
      response.cashback_amount = finalCashbackAmount;

      return response;
    };
  };
};
