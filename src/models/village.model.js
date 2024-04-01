// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class village extends Model {
  static get tableName() {
    return 'village';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],

      properties: {
        id: { type: 'integer' },

        name: { type: 'string', minLength: 1, maxLength: 255 },

        status: { type: 'string', enum: ['active', 'inactive'] }, // Updated status
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
      .hasTable('village')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('village', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns
              table.string('name', 255).nullable(); // Add company column
              table.enum('status', ['active', 'inactive']).notNullable(); // Add status column with enum constraint

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              table.index(['status']);
            })
            .then(() => console.log('Created village table'))
            .catch((e) => console.error('Error creating village table', e));
        }
      })
      .catch((e) => console.error('Error creating village table', e)); // eslint-disable-line no-console
  }

  return village;
};
