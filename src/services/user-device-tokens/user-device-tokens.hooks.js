const { fastJoin } = require('feathers-hooks-common');

const { authenticate } = require('@feathersjs/authentication').hooks;

const joinsResolves = {
  joins: {
    join: () => async (records, context) => {
      [records.user] = await Promise.all([
        context.app
          .service('users')
          .getModel()
          .query()
          .where({ id: records.user_id, deletedAt: null })
          .then((it) => it[0]),
      ]);
    },
  },
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [authenticate('jwt')],
  },

  after: {
    all: [fastJoin(joinsResolves)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
