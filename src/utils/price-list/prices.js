const { QueryTypes } = require('sequelize');

const getProductPrice = (userGroups) => (productPrices) => (product) => {
  let prices = [];

  if (!productPrices.length) {
    return {
      product_id: product.id,
      price: product.price,
      discount_price: product.discount_price,
      price_with_tax: product.price_with_tax,
      discount_price_whit_tax: product.discount_price_whit_tax,
    };
  }

  if (userGroups.length) {
    const userPrices = userGroups.map((group) => group.price_list_id);
    prices = productPrices.filter((price) =>
      userPrices.includes(price.price_list_id)
    );
  }
  if (!prices.length) {
    prices = productPrices.filter((price) => !price.price_list_groups);
  }
  if (!prices.length) {
    return {
      product_id: product.id,
      price: product.price,
      discount_price: product.discount_price,
      price_with_tax: product.price_with_tax,
      discount_price_whit_tax: product.discount_price_whit_tax,
    };
  }

  const productPrice = prices.sort((a, b) => b.priority - a.priority)[0];

  return {
    product_id: product.id,
    price: product.price,
    discount_price: productPrice.price,
    price_with_tax: product.price_with_tax,
    discount_price_whit_tax: product.tax
      ? productPrice.price * (1 + product.tax / 100)
      : productPrice.price,
  };
};

const getUserGroups = (userId) => async (context) => {
  const stmt = context.app.get('sequelizeClient');

  const userGroups = await stmt.query(
    `
  select distinct price_list_grops.price_list_id, price_list.priority, customer.user_id, customer.customer_group_id
  from customer_group_customers customer
           inner join customer_group \`group\` on customer.customer_group_id = \`group\`.id
      and \`group\`.deletedAt is null
           inner join price_list_customer_groups price_list_grops
                      on price_list_grops.customer_group_id = \`group\`.id
                          and price_list_grops.deletedAt is null
           inner join price_list on price_list_grops.price_list_id = price_list.id
      and price_list.deletedAt is null
      and price_list.status = 'active'
      and if(price_list.start_at is not null, price_list.start_at <= now(), true)
      and if(price_list.ends_at is not null, price_list.ends_at >= now(), true)
  where customer.user_id = ${userId}
    and customer.deletedAt is null
  order by price_list.priority desc
  `,
    {
      type: QueryTypes.SELECT,
    }
  );

  return userGroups;
};

const getProductsPriceLists = (productIds) => async (context) => {
  const stmt = context.app.get('sequelizeClient');

  const productsPrices = await stmt.query(
    `
    select distinct prices.product_id,
                prices.price,
                prices.price_list_id,
                price_list.priority,
                (select count(grops.id)
                 from price_list_customer_groups grops
                 where grops.deletedAt is null
                   and grops.price_list_id = price_list.id) price_list_groups
from price_list_prices prices
         inner join price_list on prices.price_list_id = price_list.id
    and price_list.deletedAt is null
    and price_list.status = 'active'
    and if(price_list.start_at is not null, price_list.start_at <= now(), true)
    and if(price_list.ends_at is not null, price_list.ends_at >= now(), true)
where prices.product_id in (${productIds.join(',')})
  and prices.deletedAt is null
order by price_list.priority desc
  `,
    {
      type: QueryTypes.SELECT,
    }
  );

  return productsPrices;
};

const getProductPrices = (user) => (productsIds) => async (context) => {
  const [productsPrices, userGroups, products] = await Promise.all([
    getProductsPriceLists(productsIds)(context),
    user ? getUserGroups(user.id)(context) : [],
    context.app
      .service('products')
      .getModel()
      .query()
      .select(
        'products.id',
        'price',
        'discount_price',
        'price_with_tax',
        'discount_price_whit_tax',
        'tax_rule.value as tax'
      )
      .innerJoin('tax_rule', 'tax_rule.id', '=', 'products.tax_rule_id')
      .whereIn('products.id', productsIds)
      .where({ 'products.deletedAt': null }),
  ]);

  const realProductsId = products.map((it) => it.id);

  return productsIds
    .filter((productId) => realProductsId.includes(productId))
    .map((productId) =>
      getProductPrice(userGroups)(
        productsPrices.filter((price) => price.product_id === productId)
      )(products.find((product) => product.id === productId))
    );
};

module.exports = {
  getProductPrices,
};
