// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class fileImage extends Model {
  static get tableName() {
    return 'file_image';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'file_image.id',
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
        data: { type: 'object' },
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
      .hasTable('file_image')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('file_image', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns
              // Timestamps
              table.binary('data');
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
            })
            .then(() => console.log('Created file image table'))
            .catch((e) => console.error('Error creating file image table', e));
        }
      })
      .catch((e) =>
        console.error('Error creating file image table', e.sqlMessage)
      ); // eslint-disable-line no-console
  }

  return fileImage;
};
