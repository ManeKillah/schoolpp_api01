// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class userDeviceTokens extends Model {
  static get tableName() {
    return 'user_device_tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        user_id: { type: 'integer' },
        deletedAt: { type: ['string', null], format: 'date-time' },
      },
    };
  }

  /*   static get relationMappings() {
    const User = require('./users.model')();

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_device_token.user_id',
          to: 'users.id'
        }
      }
    };
  } */

  $beforeInsert() {
    this.createdAt = this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = function (app) {
  if (app) {
    const db = app.get('knex');

    db.schema
      .hasTable('user_device_tokens')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('user_device_tokens', (table) => {
              table.increments('id').primary();
              table.string('name', 255);
              table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .index();
              table.timestamp('deletedAt').nullable();
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
            })
            .then(() => console.log('Created user_device_tokens table')) // eslint-disable-line no-console
            .catch((e) =>
              console.error('Error creating user_device_tokens table', e)
            ); // eslint-disable-line no-console
        }
      })
      .catch((e) =>
        console.error('Error creating user_device_tokens table', e)
      ); // eslint-disable-line no-console
  }

  return userDeviceTokens;
};
