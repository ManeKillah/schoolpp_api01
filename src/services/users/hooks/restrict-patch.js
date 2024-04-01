const { getItems, replaceItems } = require('feathers-hooks-common');
const { NotAcceptable } = require('@feathersjs/errors');

module.exports = (options = {}) => {
  return async (context) => {
    let { user } = context.params;

    let records = getItems(context);

    const userPatch = await context.app
      .service('users')
      .getModel()
      .query()
      .where({ id: context.id, deletedAt: null })
      .then((it) => it[0]);

    if (user.role === 'user') {
      if (user.id === userPatch.id) {
        if (!records.person_type) delete records.person_type;

        if (records.status !== 'deleted') delete records.status;
        return context;
      }
      if (user.company_id === userPatch.company_id) {
        if (user.owner_company !== 'true') {
          throw new NotAcceptable(
            'No tienes permisos para hacer patch a usuarios.'
          );
        }
      } else {
        throw new NotAcceptable(
          'No tienes permisos para hacer patch a usuarios.'
        );
      }
    }

    let query = {};
    if (records.email) {
      query = { email: records.email, deletedAt: null };
    }

    const currentUser = await context.app
      .service('users')
      .getModel()
      .query()
      .where(query)
      .whereNot('id', user.id)
      .then((it) => it[0]);

    if (currentUser && currentUser.id !== user.id && user.role !== 'admin') {
      throw new NotAcceptable('Ya existe el correo o teléfono.');
    }

    // const userPatch = await context.app.service;

    replaceItems(context, records);
    return context;
  };
};
