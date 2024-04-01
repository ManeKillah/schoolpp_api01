const { getItems } = require('feathers-hooks-common');
const numeral = require('numeral');
const moment = require('moment');

function getBonus(config, record) {
  if (
    config.bonus_referral_status === 'active' &&
    (record.referred_by_code || record.referred_by_user_id)
  ) {
    return {
      amount: +config.referral_bonus_amount,
      expirationDays: +config.bonus_referral_expiration_days,
      type: 'referral',
    };
  } else if (config.bonus_welcome_status === 'active') {
    return {
      amount: +config.welcome_bonus_amount,
      expirationDays: +config.bonus_welcome_expiration_days,
      type: 'welcome',
    };
  } else {
    return null;
  }
}

/**
 * Bono por primer registro con o sin código de referido
 */
module.exports = function () {
  return async (context) => {
    if (!context?.isFirstRegister) return context;

    const record = getItems(context);

    const bonusConfigurations = await context.app
      .service('configurations')
      .getModel()
      .query()
      .select('key', 'value')
      .whereIn('key', [
        'referral_bonus_amount',
        'welcome_bonus_amount',
        'bonus_referral_status',
        'bonus_welcome_status',
        'bonus_welcome_expiration_days',
        'bonus_referral_expiration_days',
      ])
      .then((res) =>
        res.reduce(
          (acc, it) => ({
            ...acc,
            [it.key]: it.value,
          }),
          {}
        )
      );

    if (
      bonusConfigurations.bonus_referral_status === 'inactive' &&
      bonusConfigurations.bonus_welcome_status === 'inactive'
    )
      return context;

    const bonus = getBonus(bonusConfigurations, record);
    if (!bonus) return context;

    await context.app
      .service('wallet-movements')
      .getModel()
      .create({
        user_id: record.id,
        type: 'welcome',
        amount_net: bonus.amount,
        description: `Te regalamos ${numeral(bonus.amount).format(
          '$ 0,0'
        )} por tu registro en nuestra app.`,
        created_by_user_id: record.id,
        expired_day: moment().add(bonus.expirationDays, 'days'),
        expired_status: 'waiting',
      });

    return context;
  };
};
