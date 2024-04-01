const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    // let { user } = context.params;
    // let records = getItems(context);

    const search = context.params?.search?.toLowerCase();
    console.log(56);
    const { start_date, end_date } = context.params;
    console.log(55, start_date);
    if (!search) {
      return;
    }
    if (!start_date || !end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      // Realizamos la consulta con whereBetween para buscar proyectos entre las fechas
      console.log(startDate, endDate);
      const projects = await context.app
        .service('project')
        .getModel()
        .query()
        .select('id')
        .whereBetween('start_date', [startDate, endDate])
        .whereNull('deletedAt');

      // Solo retornamos los IDs de los proyectos encontrados
      context.params.query.id = { $in: projects.map(({ id }) => id) };

      return context;
    }

    // Regex to match the search term
    const project = await context.app
      .service('project')
      .getModel()
      .query()
      .select('id')
      .whereRaw('LOWER(reference) LIKE ?', [`%${search.toLowerCase()}%`])
      .orWhere('id', 'like', `%${search}%`)
      .whereNull('deletedAt');

    // Only return the IDs
    context.params.query.id = { $in: project.map(({ id }) => id) };
    return context;
  };
};
