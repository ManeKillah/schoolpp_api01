const { authenticate } = require('@feathersjs/authentication').hooks;
const { paramsFromClient } = require('feathers-hooks-common');
const saveHook = require('./hooks/save-image');
const searchHook = require('./hooks/search-rental.hook');

// const joinsResolves = {
//   joins: {
//     join: () => async (records, context) => {
//       const contacts = await context.app
//         .service('contacts-directory')
//         .getModel()
//         .findAll({ where: { user_id: records.id, deletedAt: null } });

//       console.log(records.id);
//       console.log(contacts.length);
//       const hasMatchingProduct = contacts.length > 0;
//       records.professional_directory = hasMatchingProduct;
//       [records.credit_cards, records.addresses] = await Promise.all([
//         context.app
//           .service('credit-cards')
//           .getModel()
//           .query()
//           .where({ user_id: records.id, deletedAt: null }),
//         context.app
//           .service('addresses')
//           .getModel()
//           .findAll({ where: { user_id: records.id } }),
//       ]);
//     },
//   },
// };

module.exports = {
  before: {
    all: [paramsFromClient('search')],
    find: [searchHook()],
    get: [],
    create: [saveHook()],
    update: [],
    patch: [saveHook()],
    remove: [authenticate('jwt')],
  },

  after: {
    all: [],
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
