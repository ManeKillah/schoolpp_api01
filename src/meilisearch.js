const { MeiliSearch } = require('meilisearch');

const upMeilisearchClient = (app) => {
  const config = app.get('meilisearch');
  const meilisearchClient = new MeiliSearch({
    host: config.url,
    apiKey: config.key,
  });
  app.set('meilisearchClient', meilisearchClient);
};

module.exports = upMeilisearchClient;
