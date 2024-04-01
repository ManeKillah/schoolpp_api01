const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    // let { user } = context.params;
    let records = getItems(context);

    console.log(55, records);
    return context;
  };
};
