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
    const observations = await context.app
      .service('observations')
      .getModel()
      .query()
      .select('id')
      .whereRaw('LOWER(reference) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: observations.map(({ id }) => id) };
    return context;
  };
};
