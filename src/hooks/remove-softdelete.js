// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { NotAcceptable } = require("@feathersjs/errors");
// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    const { path, id } = context;

    if (id) {
      let record = await context.app.service(`${path}`).get(id);

      record = await context.app
        .service(`${path}`)
        .getModel()
        .query()
        .patch({ deletedAt: new Date().toISOString() })
        .where("id", id);

      record = await context.app
        .service(`${path}`)
        .getModel()
        .query()
        .where("id", id)
        .whereNot("deletedAt", null);

      context.result = record;
    } else if (context.path != "authentication")
      throw new NotAcceptable("for remove a record is need a id");

    return context;
  };
};
