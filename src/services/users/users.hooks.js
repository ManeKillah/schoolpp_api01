const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } =
  require('@feathersjs/authentication-local').hooks;
const searchAdmin = require('./hooks/search-admin');
const activateUser = require('./hooks/activate-user');
const restrictPatch = require('./hooks/restrict-patch');

const {
  discard,
  iff,
  isProvider,
  disallow,
  fastJoin,
  paramsFromClient,
} = require('feathers-hooks-common');
const removeSoftDelete = require('../../hooks/remove-softdelete');
const restrictUpdateRol = require('./hooks/restrict-update-rol');
const validUserDelete = require('./hooks/valid-user-delete');
const saveImage = require('./hooks/save-image');
const validateUserExistsHook = require('./hooks/validate-user-exists.hook');
const searchUser = require('./hooks/search-rental.hook');
const updateContactDirectoryHook = require('./hooks/update-contact-directory.hook');
const createUserReferralCodeHook = require('./hooks/create-user-referral-code.hook');
const registerUserReferredCodeHook = require('./hooks/register-user-referred-code.hook');
const firstRegisterBonusHook = require('./hooks/first-register-bonus.hook');

const joinsResolves = {
  joins: {
    join: () => async (records, context) => {
      // [records.credit_cards, records.addresses] = await Promise.all([
      //   context.app
      //     .service('credit-cards')
      //     .getModel()
      //     .query()
      //     .where({ user_id: records.id, deletedAt: null }),
      //   context.app
      //     .service('addresses')
      //     .getModel()
      //     .findAll({ where: { user_id: records.id } }),
      // ]);
    },
  },
};

module.exports = {
  before: {
    all: [paramsFromClient('search')],
    find: [iff(isProvider('external'), searchAdmin()), searchUser()],
    get: [iff(isProvider('external'), searchAdmin())],
    create: [saveImage(), hashPassword('password')],
    update: [disallow('external'), saveImage()],
    patch: [
      iff(
        isProvider('external'),
        discard(
          'credits',
          'facebookId',
          'token_reset_password',
          'password',
          'owner_company',
          'token_login_email',
          'token_login_phone',
          'referral_bonus_status',
          'referred_by_user_id',
          'first_purchase_with_wallet_status'
        )
      ),
      saveImage(),
      validateUserExistsHook(),
      restrictUpdateRol(),
      hashPassword('password'),
      restrictPatch(),
      activateUser(),
      validUserDelete(),
    ],
    remove: [authenticate('jwt'), removeSoftDelete()],
  },

  after: {
    all: [protect('password'), fastJoin(joinsResolves)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
