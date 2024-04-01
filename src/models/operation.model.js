// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class operations extends Model {
  static get tableName() {
    return 'operations';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'operations.id',
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
        user_id: { type: 'integer' }, // Added container_id
        user_name: { type: 'string', minLength: 1, maxLength: 255 },
        user_email: { type: 'string', minLength: 1, maxLength: 255 },
        reference: { type: 'string', minLength: 1, maxLength: 255 },
        // reference: { type: 'string', minLength: 1, maxLength: 255 },
        operation_date: { type: ['string', 'null'], format: 'date-time' }, // Updated start_date
        // end_date: { type: ['string', 'null'], format: 'date-time' }, // Updated end_date
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
      .hasTable('operations')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('operations', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns
              table.integer('user_id').notNullable(); // Add container_id column
              // table.integer('project_id').notNullable(); // Add project_id column
              // table.integer('equipment_id').notNullable(); // Add equipment_id column
              // table.string('compan', 255).Nullable(); // Add company column
              table.string('user_name', 255).nullable(); // Add company column
              table.string('user_email', 255).nullable(); // Add company column
              table.string('reference', 255).nullable(); // Add company column
              table.timestamp('operation_date').nullable().defaultTo(null); // Add start_date column
              // table.timestamp('end_date').nullable().defaultTo(null); // Add end_date column
              table.enum('status', ['active', 'inactive']).notNullable(); // Add status column with enum constraint

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              table.index(['status']);
            })
            .then(() => console.log('Created operations table'))
            .catch((e) => console.error('Error creating operations table', e));
        }
      })
      .catch((e) => console.error('Error creating operations table', e)); // eslint-disable-line no-console
  }

  return operations;
};
