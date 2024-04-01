const { getItems, replaceItems } = require('feathers-hooks-common')

const addBatchDocuments = () => async (context) => {
  const app = context.app
  const config = app.get('meilisearch')
  const meilisearch = app.get('meilisearchClient')
  const payload = getItems(context)
  const meilisearchIndex = meilisearch.index(payload?.index || config.index)

  const response = await meilisearchIndex
    .addDocuments(
      Array.isArray(payload.records)
        ? payload.records
        : [payload.records]
    )

  replaceItems(context, response)

  return context
}

module.exports = addBatchDocuments
