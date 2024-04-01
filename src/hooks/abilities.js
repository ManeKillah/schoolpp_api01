const { AbilityBuilder, Ability } = require('@casl/ability');
const { toMongoQuery } = require('@casl/mongoose');
const { Forbidden } = require('@feathersjs/errors');
const TYPE_KEY = Symbol.for('type');
const { rulesToQuery } = require('@casl/ability/extra');
const { Op } = require('sequelize');
const { SEQUELIZE_MODELS } = require('../constants');
const {
  USER_CHALLENGE_SUBSCRIPTIONS,
  DROPS_TRANSACTIONS,
  CATEGORIES,
} = require('../utils/constans');

Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('delete', 'remove');

const READ = 'read';
const PATCH = 'update';
const DELETE = 'delete';

function subjectName(subject) {
  if (!subject || typeof subject === 'string') {
    return subject;
  }

  return subject[TYPE_KEY];
}

function symbolize(query) {
  return JSON.parse(JSON.stringify(query), function keyToSymbol(key, value) {
    if (key[0] === '$') {
      const symbol = Op[key.slice(1)];
      this[symbol] = value;
      return;
    }
    return value;
  });
}

function ruleToSequelize(rule) {
  return rule.inverted ? { $not: rule.conditions } : rule.conditions;
}

function toSequelizeQuery(ability, subject, action) {
  const query = rulesToQuery(ability, action, subject, ruleToSequelize);
  return query === null ? query : symbolize(query);
}

function defineAbilitiesFor(user, context) {
  const { rules, can, cannot } = AbilityBuilder.extract();

  can('read', [CATEGORIES]);
  // can('get', 'configuration-cashback');

  if (
    context.service.path === 'authentication' &&
    context.service.data.strategy === 'jwt'
  ) {
    can('read', ['users']);
  }

  can('create', ['users']);
  // can('manage', ['all']);

  can('read', []);

  can('update', []);
  can('remove', []);

  console.log('[user]', user);

  if (user) {
    if (user?.current_device_os_version === 'mobile' && user?.rol === 'admin') {
      cannot('manage', ['all']);
    }
    if (user.status === 'active') {
      //hacer acciones
      can('create', [
        USER_CHALLENGE_SUBSCRIPTIONS,
        'user-offer-redemptions',
        'health-data',
        'rental',
      ]);

      can(READ, ['users'], { id: user.id });
      can(READ, [
        'project',
        'equipment',
        'container',
        CATEGORIES,
        'health-data',
      ]);

      can(
        'read',
        [
          USER_CHALLENGE_SUBSCRIPTIONS,
          'user-offer-redemptions',
          DROPS_TRANSACTIONS,
        ],
        {
          user_id: user.id,
        }
      );

      can('update', ['users']);

      if (user.role === 'superadmin') {
        can('manage', ['all']);
      }

      if (user.role === 'user') {
        can('manage', ['user'], { id: user.id });
      }

      if (user.role === 'admin') {
        can('manage', ['all']);
      }
    } else if (
      (user && user.status === 'pending_information') ||
      user.status === 'pending_verification'
    ) {
      can(['read', 'update'], ['users'], { id: user.id });
    } else {
      cannot('manage', ['all']);
      throw new Forbidden('Tu usuario se encuentra inactivo.');
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    can('create', ['users']);
  }

  return new Ability(rules, { subjectName });
}

function canReadQuery(query) {
  return query !== null;
}

module.exports = function authorize(name = null) {
  return async function (hook) {
    const action = hook.method;
    const service = name ? hook.app.service(name) : hook.service;
    const serviceName = name || hook.path;
    const ability = defineAbilitiesFor(hook.params.user, hook);
    const throwUnlessCan = (action, resource) => {
      if (ability.cannot(action, resource)) {
        throw new Forbidden(`You are not allowed to ${action} ${serviceName}`);
      }
    };

    hook.params.ability = ability;

    if (hook.method === 'create') {
      hook.data[TYPE_KEY] = serviceName;
      throwUnlessCan('create', hook.data);
    }

    if (!hook.id) {
      // const query = toMongoQuery(ability, serviceName, action);
      const query = (
        SEQUELIZE_MODELS.includes(serviceName) ? toSequelizeQuery : toMongoQuery
      )(ability, serviceName, action);

      if (canReadQuery(query)) {
        Object.assign(hook.params.query, query);
      } else {
        // The only issue with this is that user will see total amount of records in db
        // for the resources which he shouldn't know.
        // Alternative solution is to assign `__nonExistingField` property to query
        // but then feathers-mongoose will send a query to MongoDB which for sure will return empty result
        // and may be quite slow for big datasets
        hook.params.query.id = 0;
      }

      return hook;
    }

    const params = Object.assign({}, hook.params, { provider: null });
    const result = await service.get(hook.id, params);

    result[TYPE_KEY] = serviceName;
    throwUnlessCan(action, result);

    if (action === 'get') {
      // eslint-disable-next-line require-atomic-updates
      hook.result = result;
    }

    return hook;
  };
};
