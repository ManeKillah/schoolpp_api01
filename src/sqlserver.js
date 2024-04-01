const knex = require('knex');

const upSqlServerInstance = (app) => {
  const config = app.get('sqlSever');

  const knexInstance = knex({
    client: 'mssql',
    connection: config,
  });

  app.set('sqlServerInstance', knexInstance);
};

module.exports = upSqlServerInstance;
