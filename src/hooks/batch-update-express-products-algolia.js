// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const {
  // checkContext,
  getItems,
  replaceItems
} = require("feathers-hooks-common");
// const algolia = require("../utils/algolia/");
// eslint-disable-next-line no-unused-vars
module.exports = (options = {}, index) => {
  return async context => {
    let records = getItems(context);

    // const data = options.map(it => ({ ...it, id: `product-${it.id}`, type: 'product', real_id: it.id }));

    // const algoliaCredemtials = context.app.get("algolia");

    // const Algolia = new algolia(
    //   `${index}`,
    //   algoliaCredemtials.appId,
    //   algoliaCredemtials.apiKey
    // );

    // Algolia.update_all(data);

    context.app.service('meilisearch').patch(null, { index: 'search', records: options })

    replaceItems(context, records);

    return context;
  };
};
