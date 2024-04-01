const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const authentication = require('./authentication');

const objection = require('./objection');
const WompiClass = require('./utils/wompi/Wompi.class');
const meilisearch = require('./meilisearch');
const sequelize = require('./sequelize');
const sqlServer = require('./sqlserver');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
console.log(99, app.get('public'));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio());

app.configure(objection);
app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.configure(sqlServer);

// Meilisearch
app.configure(meilisearch);

const adminUser = {
  email: 'admin@admin.com',
  password: 'secret',
  role: 'admin',
};

// Buscar si ya existe un usuario con el correo electrónico del administrador
app
  .service('users')
  .find({ query: { email: adminUser.email } })
  .then((users) => {
    if (users.total === 0) {
      return app
        .service('users')
        .create(adminUser)
        .then((user) => {
          console.log('Usuario administrador creado:', user);
        })
        .catch((error) => {
          console.error('Error al crear el usuario administrador:', error);
        });
    } else {
      console.log('El usuario administrador ya existe.');
    }
  })
  .catch((error) => {
    console.error('Error al buscar el usuario administrador:', error);
  });

app.hooks(appHooks);

// Wompi class
// const wompi = new WompiClass(app);

// app.set('wompiClient', wompi);

module.exports = app;
