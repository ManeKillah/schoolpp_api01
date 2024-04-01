// Initializes the `meilisearh` service on path `/meilisearh`
const { Meilisearch } = require('./meilisearch.class')
const hooks = require('./meilisearch.hooks')


module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
    multi: ['create', 'update', 'patch', 'remove'],
  }

  // Initialize our service with any options it requires
  app.use('/meilisearch', new Meilisearch(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('meilisearch')

  service.hooks(hooks)
}
