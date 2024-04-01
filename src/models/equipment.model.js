// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class equipment extends Model {
  static get tableName() {
    return 'equipment';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'equipment.id',
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
        name: { type: 'string', minLength: 1, maxLength: 255 },
        reference_con: { type: 'string', minLength: 1, maxLength: 255 },
        reference_pre: { type: 'string', minLength: 1, maxLength: 255 },
        url_image: { type: 'string', minLength: 1, maxLength: 255 },
        out_motive: { type: 'string', minLength: 1, maxLength: 255 },
        location: { type: 'string', minLength: 1, maxLength: 255 },
        import: { type: 'string', minLength: 1, maxLength: 255 },
        project_name: { type: 'string', minLength: 1, maxLength: 255 },
        // equipment_name: { type: 'string', minLength: 1, maxLength: 255 },
        image_url: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
        project_id: { type: 'integer' }, // Added project_id
        equipment_id: { type: 'integer' }, // Added equipment_id
        // name: { type: 'string', minLength: 1, maxLength: 255 },
        status: { type: 'string', enum: ['active', 'inactive'] }, // Updated status
        review_date: { type: ['string', 'null'], format: 'date-time' },
        out_date: { type: ['string', 'null'], format: 'date-time' },
        in_date: { type: ['string', 'null'], format: 'date-time' }, // Updated status
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
      .hasTable('equipment')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('equipment', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();

              // Columns
              table.integer('store_id').nullable();
              table.string('store_name', 255).nullable();
              table.string('image_url', 255).nullable();
              table.string('location', 255).nullable();
              // table.string('equipment_name', 255).nullable();
              table.string('project_name', 255).nullable();
              table.string('out_motive', 255).nullable();
              // table.string('out_date', 255).nullable();
              table.string('import', 255).nullable();
              table.integer('container_id').notNullable(); // Add container_id column
              table.integer('project_id').notNullable(); // Add project_id column
              table.integer('equipment_id').notNullable(); // Add equipment_id column
              table.string('company', 255).nullable(); // Add company column, changed to nullable
              table.string('name', 255).nullable(); // Add company column, changed to nullable
              // table.string('reference', 255).nullable(); // Add reference column, changed to nullable
              table.string('reference_pre', 255).nullable(); // Add reference column, changed to nullable
              table.string('reference_con', 255).nullable(); // Add reference column, changed to nullable
              table.timestamp('out_date').nullable(); // Add start_date column, changed default
              table.timestamp('in_date').nullable(); // Add start_date column, changed default
              table.timestamp('review_date').nullable(); // Add start_date column, changed default
              table.timestamp('start_date').nullable(); // Add start_date column, changed default
              table.timestamp('end_date').nullable(); // Add end_date column, changed default
              table.enum('status', ['active', 'inactive']).notNullable(); // Add status column with enum constraint

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              table.index(['status']);
            })
            .then(() => console.log('Created equipment table'))
            .catch((e) => console.error('Error creating equipment table', e));
        }
      })
      .catch((e) => console.error('Error creating equipment table', e)); // eslint-disable-line no-console
  }

  return equipment;
};
