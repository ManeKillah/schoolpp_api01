const { getItems } = require('feathers-hooks-common');

module.exports = (options = {}) => {
  return async (context) => {
    const record = getItems(context);

    const id = await context.app
      .service('contacts-directory')
      .getModel()
      .findAll({ where: { id: record.id, deletedAt: null } })
      .then((res) => (res.length ? res[0] : null));

    console.log(id);
    if (!id) return context;

    await context.app.service('contacts-directory').patch(id, {});

    return context;
  };
};
