const { Sequelize } = require('sequelize')

const upSequelizeClient = (app) => {
  const connectionString = app.get('mysql')
  const sequelize = new Sequelize(connectionString.connection, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    define: {
      freezeTableName: true,
    },
  })
  const oldSetup = app.setup

  app.set('sequelizeClient', sequelize)
  // sequelize.sync({ alter: true }).catch((err) => console.log(err))

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args)

    // Set up data relationships
    const models = sequelize.models
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) (models[name]).associate(models, app)
    })

    return result
  }
}

module.exports = upSequelizeClient
