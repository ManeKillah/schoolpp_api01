const { getItems, replaceItems } = require('feathers-hooks-common');

const updateBatchDocuments = () => async (context) => {
  try {
    const app = context.app;
    const config = app.get('meilisearch');
    const meilisearch = app.get('meilisearchClient');
    const payload = getItems(context);
    const meilisearchIndex = meilisearch.index(payload?.index || config.index);

    const response = await meilisearchIndex.addDocuments(
      Array.isArray(payload.records) ? payload.records : [payload.records]
      );
    replaceItems(context, response);
  }
  catch (error) {
    console.error(11111, error);
  }

  return context;
};

module.exports = updateBatchDocuments;
