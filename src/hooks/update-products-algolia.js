// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { getItems, replaceItems } = require("feathers-hooks-common");
// eslint-disable-next-line no-unused-vars
module.exports = (id = {}) => {
  return async (context) => {
    let records = getItems(context);

    await context.app.service("products").patch(id, {});

    replaceItems(context, records);

    return context;
  };
};
