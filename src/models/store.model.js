// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class store extends Model {
  static get tableName() {
    return 'store';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],

      properties: {
        id: { type: 'integer' },
        store_leader_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        reference: { type: 'string', minLength: 1, maxLength: 255 },
        image_url: { type: 'string', minLength: 1, maxLength: 255 },
        store_leader: { type: 'string', minLength: 1, maxLength: 255 },
        location: { type: 'string', minLength: 1, maxLength: 255 },

        // status: { type: 'string', enum: ['active', 'inactive'] }, // Updated status
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
      .hasTable('store')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('store', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns

              table.string('name', 255).nullable(); // Add company column
              table.string('image_url', 255).nullable(); // Add company column
              table.integer('store_leader_id').nullable(); // Add company column
              table.string('store_leader', 255).nullable(); // Add company column
              table.string('reference', 255).nullable(); // Add company column
              table.string('location', 255).nullable(); // Add company column
              // table.enum('status', ['active', 'inactive']).notNullable(); // Add status column with enum constraint

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              // table.index(['status']);
            })
            .then(() => console.log('Created store table'))
            .catch((e) => console.error('Error creating store table', e));
        }
      })
      .catch((e) => console.error('Error creating store table', e)); // eslint-disable-line no-console
  }

  return store;
};
