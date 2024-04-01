// const { authenticate } = require('@feathersjs/authentication')
const addBatchDocuments = require('./hooks/add-batch-documents.hook');
const updateBatchDocuments = require('./hooks/update-batch-documents.hook');
// const allowOnlyAdminHook = require('../../hooks/allow-only-admin.hook')
const deleteBatchDocuments = require('./hooks/delete-batch-documents.hook');

module.exports = {
  before: {
    all: [
      /*authenticate('jwt'), allowOnlyAdminHook()*/
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [addBatchDocuments()],
    update: [],
    patch: [updateBatchDocuments()],
    remove: [deleteBatchDocuments()],
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
