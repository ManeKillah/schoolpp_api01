function getProductPrice(product) {
  return product.discount_price_whit_tax || product.price_with_tax;
}

function getProductPriceTaxExcluded(product) {
  return product.discount_price || product.price;
}

function getTotalOrderProducts(products) {
  return products.reduce(
    (total, product) =>
      total + getProductPrice(product) * (product.quantity || 1),
    0
  );
}

module.exports = {
  getProductPrice,
  getProductPriceTaxExcluded,
  getTotalOrderProducts,
};
