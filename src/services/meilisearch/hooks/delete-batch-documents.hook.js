
const { replaceItems } = require('feathers-hooks-common')

const deleteBatchDocuments = () => async (context) => {
  const app = context.app
  const config = app.get('meilisearch')
  const meilisearch = app.get('meilisearchClient')
  const payload = context.params.query
  const meilisearchIndex = meilisearch.index(payload.index || config.index)

  const response = await meilisearchIndex
    .deleteDocuments(
      Array.isArray(payload.records)
        ? payload.records
        : [payload.records]
    )

  replaceItems(context, response)

  return context
}

module.exports = deleteBatchDocuments
