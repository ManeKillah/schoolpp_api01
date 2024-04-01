const { discard } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    let { user } = context.params;

    if (user.role !== 'admin') return discard('role', 'status')(context);

    return context;
  };
};
