// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async () => {
    const { pack } = options;

    let totalWeight = 0;
    let heigh = 1;
    let width = 1;
    let long = 1;
    let declared_value = 0;
    let units = 0;

    for (const key in pack) {
      const product = pack[key];
      //CALCULAMOS EL VALOR DECLARADO
      declared_value +=
        (product.product_quantity
          ? product.product_quantity
          : product.shopping_cart_details_quantity) * product.price;
      units = +product.product_quantity;

      //CALCULAMOS EL PESO TOTAL
      const weight = product.weight ? product.weight : 1;
      totalWeight +=
        (product.product_quantity
          ? product.product_quantity
          : product.shopping_cart_details_quantity) * weight;

      //CALCULAMOS EL VOLUMEN
      if (heigh < product.heigh) heigh = product.heigh;
      if (width < product.width) width = product.width;
      if (long < product.long) long = product.long;
    }

    return {
      totalWeight: totalWeight || 1,
      heigh: heigh || 1,
      width: width || 1,
      long: long || 1,
      declared_value: declared_value || 0,
      units,
    };
  };
};
