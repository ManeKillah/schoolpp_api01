const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    let { user } = context.params;

    let records = getItems(context);

    if (
      user.status === 'pending_information' &&
      user.first_name &&
      user.last_name &&
      // user.dni &&
      user.phone &&
      user.email
    ) {
      records.status = 'active';
      context.isFirstRegister = true;
    }
    replaceItems(context, records);
    return context;
  };
};
