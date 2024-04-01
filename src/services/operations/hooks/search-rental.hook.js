const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    // let { user } = context.params;
    // let records = getItems(context);

    const search = context.params?.search?.toLowerCase();
    console.log(44, search);
    // console.log(56);
    const { start_date, end_date } = context.params;
    // console.log(55, start_date);
    if (!search) {
      return;
    }
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      // Realizamos la consulta con whereBetween para buscar proyectos entre las fechas
      // console.log(startDate, endDate);
      const stores = await context.app
        .service('operations')
        .getModel()
        .query()
        .select('id')
        .whereBetween('operation_date', [startDate, endDate])
        .whereNull('deletedAt');

      // Solo retornamos los IDs de los proyectos encontrados
      context.params.query.id = { $in: stores.map(({ id }) => id) };

      return context;
    }

    // Regex to match the search term
    const operations = await context.app
      .service('operations')
      .getModel()
      .query()
      .select('id')
      .whereRaw('LOWER(user_name) LIKE ?', [`%${search.toLowerCase()}%`])
      .whereRaw('LOWER(user_email) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: operations.map(({ id }) => id) };
    return context;
  };
};
