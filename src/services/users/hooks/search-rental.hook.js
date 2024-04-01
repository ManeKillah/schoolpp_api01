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
    const users = await context.app
      .service('users')
      .getModel()
      .query()
      .select('id')
      .orWhereRaw('LOWER(first_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(email) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(last_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: users.map(({ id }) => id) };
    return context;
  };
};
