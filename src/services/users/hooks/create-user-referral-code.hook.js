const { getItems, replaceItems } = require('feathers-hooks-common');
const crypto = require('crypto');

module.exports = function () {
  return async (context) => {
    const record = getItems(context);

    if (record.referral_code || record.status !== 'active') return context;

    const userId = record.id;
    const randomWords = crypto.randomBytes(1).toString('hex');

    record.referral_code = `${userId}${randomWords}`;

    await context.app
      .service('users')
      .getModel()
      .query()
      .patch({
        referral_code: record.referral_code,
      })
      .where({
        id: userId,
      });

    replaceItems(context, record);

    return context;
  };
};
