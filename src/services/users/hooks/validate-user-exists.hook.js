const { NotAcceptable } = require('@feathersjs/errors');
const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => async (context) => {
  const records = getItems(context);
  const user = context.params.user;

  if (user.role === 'admin') return context;

  const where = {};

  if (user.email && user.phone) {
    delete records.phone;
    delete records.email;

    replaceItems(context, records);

    return context;
  }

  if (user.email) {
    where.phone = records.phone;
  } else if (user.phone) {
    where.email = records.email;
  } else {
    throw new NotAcceptable('Debes enviar email o teléfono');
  }

  const userExists = await context.app
    .service('users')
    .getModel()
    .query()
    .where(where)
    .then((res) => res.length > 0);

  if (userExists)
    throw new NotAcceptable(
      `El ${
        user.email ? 'número de teléfono' : 'correo electrónico'
      } ingresado ya se encuentra registrado.`
    );

  return context;
};
