const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    // let { user } = context.params;
    // let records = getItems(context);

    const search = context.params?.search?.toLowerCase();
    if (!search) {
      return;
    }

    // Regex to match the search term
    const store = await context.app
      .service('store')
      .getModel()
      .query()
      .select('id')
      .whereRaw('LOWER(reference) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .orWhere('LOWER(location) LIKE ?', [`%${search.toLowerCase()}%`])
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: store.map(({ id }) => id) };
    return context;
  };
};
