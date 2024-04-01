// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
const { Model } = require('objection');

class users extends Model {
  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    const userDeviceTokens = require('./user-device-tokens.model')();

    return {
      'user-device-tokens': {
        relation: Model.HasManyRelation,
        modelClass: userDeviceTokens,
        join: {
          from: 'users.id',
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
        observation_id: { type: 'integer' },
        first_name: { type: 'string', minLength: 1, maxLength: 255 },
        last_name: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
        reference: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: ['string', 'null'], format: 'email' },
        phone_country_code: { type: ['string', 'null'], maxLength: 5 },
        phone: { type: ['string', 'null'], maxLength: 15 },
        role: { type: 'string', enum: ['superadmin', 'admin', 'user'] },
        status: {
          type: 'string',
          enum: [
            'active',
            'inactive',
            'pending_verification',
            'pending_information',
          ],
        },
        otp_code: { type: ['string', 'null'], maxLength: 10 },
        otp_expiry: { type: ['string', 'null'], format: 'date-time' },
        current_device_os_version: { type: ['string', 'null'], maxLength: 200 },
        current_device_brand: { type: ['string', 'null'], maxLength: 200 },
        current_codepush_version: { type: ['string', 'null'], maxLength: 200 },
        current_device_id: { type: ['string', 'null'], maxLength: 200 },
        current_firebase_token: { type: ['string', 'null'], maxLength: 200 },
        current_apple_token: { type: ['string', 'null'], maxLength: 200 },

        deleted_email: { type: ['string', 'null'], maxLength: 255 },
        deleted_phone: { type: ['string', 'null'], maxLength: 255 },
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
      .hasTable('users')
      .then((exists) => {
        if (!exists) {
          db.schema
            .createTable('users', (table) => {
              // Primary key and unique constraints
              table.increments('id').primary();
              table.string('email').unique();

              // Basic user information
              table.string('first_name');
              table.string('last_name').nullable();
              table.string('reference');

              // Authentication
              table.string('password');

              // Additional user details
              table.string('dni');

              // Phone details
              table.string('phone_country_code', 5);
              table.string('phone', 15);

              // User role and status
              table.enum('role', ['superadmin', 'admin', 'user']).notNull();
              table
                .enum('status', [
                  'active',
                  'inactive',
                  'pending_verification',
                  'pending_information',
                ])
                .notNull();

              // One-time password related columns
              table.string('otp_code', 10);
              table.timestamp('otp_expiry');

              // Device information
              table.string('current_device_os_version', 200);
              table.string('current_device_brand', 200);
              table.string('current_codepush_version', 200);
              table.string('current_device_id', 200);

              // Push notification tokens
              table.string('current_firebase_token', 200);
              table.string('current_apple_token', 200);
              table.text('avatar_path');

              // Device type

              // Deleted information
              table.string('deleted_email').nullable();
              table.string('deleted_phone').nullable();

              // Timestamps
              table.timestamp('createdAt').defaultTo(db.fn.now());
              table.timestamp('updatedAt').defaultTo(db.fn.now());
              table.timestamp('deletedAt').nullable();

              // Indexes
              table.index(['status']);
              table.index(['role']);
            })
            .then(() => console.log('Created users table'))
            .catch((e) => console.error('Error creating users table', e));
        }
      })
      .catch((e) => console.error('Error creating users table', e)); // eslint-disable-line no-console
  }

  return users;
};
