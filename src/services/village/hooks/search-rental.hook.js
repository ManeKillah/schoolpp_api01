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
    const rental = await context.app
      .service('rental')
      .getModel()
      .query()
      .select('id')
      .whereRaw('LOWER(reference) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(project_id) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(project_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(container_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(equipment_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhereRaw('LOWER(equipment_id) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: rental.map(({ id }) => id) };
    return context;
  };
};
