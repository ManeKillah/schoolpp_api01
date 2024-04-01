const { NotFound } = require('@feathersjs/errors');
const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = function () {
  return async (context) => {
    const record = getItems(context);

    if (record.status !== 'active' || !record.referred_by_code) return context;

    const userDb = await context.app
      .service('users')
      .getModel()
      .query()
      .where({
        id: context.id,
      })
      .first();

    console.log('[userDb]', userDb);

    if (
      userDb.referred_by_code ||
      userDb.referred_by_user_id ||
      userDb.status !== 'pending user data'
    ) {
      delete record.referred_by_code;
      delete record.referred_by_user_id;
      replaceItems(context, record);
      return context;
    }

    const referralUser = await context.app
      .service('users')
      .getModel()
      .query()
      .select('id', 'referral_code')
      .where({
        referral_code: record.referred_by_code,
      })
      .first();

    if (!referralUser) throw new NotFound('Código no encontrado');

    record.referred_by_user_id = referralUser.id;
    record.referred_by_code = referralUser.referral_code;

    return context;
  };
};
