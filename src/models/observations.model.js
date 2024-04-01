// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class observations extends Model {
  static get tableName() {
    return 'observations';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'observations.id',
          to: 'user_device_tokens.user_id',
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],

      properties: {
        id: { type: 'integer' },

        message: { type: 'string', minLength: 1, maxLength: 255 },
        reference: { type: 'string', minLength: 1, maxLength: 255 },
        creation_date: { type: ['string', 'null'], format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: ['string', 'null'], format: 'date-time' },
      },
    };
  }

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
      .hasTable('observations')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('observations', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();
              table.string('message', 255).nullable(); // Add company column
              table.string('reference', 255).nullable(); // Add company column

              table.timestamp('creation_date').nullable().defaultTo(null); // Add start_date column

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();
            })
            .then(() => console.log('Created observations table'))
            .catch((e) =>
              console.error('Error creating observations table', e)
            );
        }
      })
      .catch((e) => console.error('Error creating observations table', e)); // eslint-disable-line no-console
  }

  return observations;
};
