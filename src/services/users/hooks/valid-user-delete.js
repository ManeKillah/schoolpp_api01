const { getItems, replaceItems } = require('feathers-hooks-common');
const { NotFound, NotAcceptable } = require('@feathersjs/errors');
const moment = require('moment');

module.exports = (options = {}) => {
  return async (context) => {
    const records = getItems(context);

    const getUser = ({ id }) =>
      context.app
        .service('users')
        .getModel()
        .query()
        .where({ id, deletedAt: null })
        .then((it) => it[0]);

    if (records.status !== 'deleted') return context;

    if (records.status === 'deleted' && !records.deleted_reason)
      throw new NotAcceptable('Debes enviar la razón.');

    const user = await getUser({ id: context.id });

    if (!user) throw new NotFound('No se encontró el usuario.');

    records.phone = `${user.phone}#${moment().format()}`;
    records.email = `${user.email}#${moment().format()}`;
    records.deleted_email = user.email;
    records.deleted_phone = user.phone;

    replaceItems(context, records);
    return context;
  };
};
