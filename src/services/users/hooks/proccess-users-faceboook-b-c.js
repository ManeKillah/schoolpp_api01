// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const moment = require("moment");

const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    if (records.facebookId) {
      records.birthday = moment(context.data.birthday).format("YYYY-MM-DD");
    }

    replaceItems(context, records);

    return context;
  };
};
