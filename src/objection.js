const { Model } = require('objection');

const connect = (app) => {
  const { client, connection } = app.get('mysql');
  const knex = require('knex')({
    client,
    connection,
    useNullAsDefault: false,
    pool: { min: 0, max: 10 },
  });
  knex.on('query', (data) => {
    console.log(data.sql);
  });
  Model.knex(knex);

  app.set('knex', knex);
};

module.exports = function (app) {
  connect(app);
};
