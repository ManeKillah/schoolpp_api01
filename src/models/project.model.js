// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class project extends Model {
  static get tableName() {
    return 'project';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'project.id',
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
        reference: { type: 'string', minLength: 1, maxLength: 255 },
        name: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
        company: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
        container_id: { type: 'integer' }, // Added container_id
        project_id: { type: 'integer' }, // Added project_id
        equipment_id: { type: 'integer' }, // Added equipment_id
        city_id: { type: 'integer' }, // Added equipment_id
        country_id: { type: 'integer' }, // Added equipment_id
        village_id: { type: 'integer' }, // Added equipment_id
        ejecutive: { type: 'string', minLength: 1, maxLength: 255 },
        project_address: {
          type: ['string', 'null'],
          minLength: 1,
          maxLength: 255,
        },
        billis_address: {
          type: ['string', 'null'],
          minLength: 1,
          maxLength: 255,
        },
        project_manager: { type: 'string', minLength: 1, maxLength: 255 },
        tean_leader: { type: 'string', minLength: 1, maxLength: 255 },
        CIF: { type: 'string', minLength: 1, maxLength: 255 },
        dane_code: { type: 'string', minLength: 1, maxLength: 255 },
        start_date: { type: ['string', 'null'], format: 'date-time' }, // Updated start_date
        billis_start_date: { type: ['string', 'null'], format: 'date-time' }, // Updated start_date
        end_date: { type: ['string', 'null'], format: 'date-time' }, // Updated end_date
        billis_end_date: { type: ['string', 'null'], format: 'date-time' }, // Updated end_date
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
      .hasTable('project')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('project', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns
              table.integer('container_id').notNullable(); // Add container_id column
              table.integer('project_id').notNullable(); // Add project_id column
              table.integer('equipment_id').notNullable(); // Add equipment_id column
              table.integer('city_id').notNullable(); // Add equipment_id column
              table.integer('village_id').notNullable(); // Add equipment_id column
              table.integer('country_id').notNullable(); // Add equipment_id column
              table.string('project_address', 255).nullable(); // Add company column
              table.string('billis_address', 255).nullable(); // Add company column
              table.string('CIF', 255).nullable(); // Add company column
              table.string('dane_code', 255).nullable(); // Add company column
              table.string('ejecutive', 255).nullable(); // Add company column
              table.string('project_manager', 255).nullable(); // Add company column
              table.string('tean_leader', 255).nullable(); // Add company column
              table.string('reference', 255).nullable(); // Add company column
              table.string('company', 255).nullable(); // Add company column
              table.string('name', 255).nullable(); // Add company column
              table.timestamp('start_date').nullable().defaultTo(null); // Add start_date column
              table.timestamp('billis_start_date').nullable().defaultTo(null); // Add start_date column
              table.timestamp('end_date').nullable().defaultTo(null); // Add end_date column
              table.timestamp('billis_end_date').nullable().defaultTo(null); // Add end_date column
              table.enum('status', ['active', 'inactive']).notNullable(); // Add status column with enum constraint

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              table.index(['status']);
            })
            .then(() => console.log('Created project table'))
            .catch((e) => console.error('Error creating project table', e));
        }
      })
      .catch((e) => console.error('Error creating project table', e)); // eslint-disable-line no-console
  }

  return project;
};
