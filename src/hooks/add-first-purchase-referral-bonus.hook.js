const { GeneralError } = require('@feathersjs/errors');
const moment = require('moment');

module.exports = function (orderId) {
  return async (context) => {
    const ordersModel = context.app.service('orders').getModel();
    const usersModel = context.app.service('users').getModel();
    const walletMovementsModel = context.app
      .service('wallet-movements')
      .getModel();

    const bonusCofiguration = await context.app
      .service('configurations')
      .getModel()
      .query()
      .select('key', 'value')
      .whereIn('key', [
        'bonus_for_referring_amount',
        'bonus_referral_expiration_days',
        'bonus_referral_status',
      ])
      .then((res) =>
        res.reduce((acc, it) => ({ ...acc, [it.key]: it.value }), {})
      );

    if (bonusCofiguration.bonus_referral_status === 'inactive') return context;

    const order = await ordersModel
      .query()
      .where({
        id: orderId,
        order_status_id: 9,
      })
      .first();

    if (!order) return context;

    const userBuyer = await usersModel
      .query()
      .where({
        id: order.user_id,
      })
      .first();

    if (!userBuyer) throw new GeneralError('User buyer not found.');

    if (
      userBuyer.referral_bonus_status === 'done' ||
      !userBuyer.referred_by_user_id
    )
      return context;

    const referralUser = await usersModel
      .query()
      .select('id')
      .where({
        id: userBuyer.referred_by_user_id,
      })
      .first();

    if (!referralUser) return context;

    await Promise.all([
      walletMovementsModel.create({
        user_id: referralUser.id,
        type: 'referral',
        amount_net: +bonusCofiguration.bonus_for_referring_amount,
        description: 'Bono de referido.',
        created_by_user_id: userBuyer.id,
        expired_day: moment().add(
          +bonusCofiguration.bonus_referral_expiration_days,
          'days'
        ),
        expired_status: 'waiting',
      }),
      usersModel
        .query()
        .patch({
          referral_bonus_status: 'done',
        })
        .where({
          id: userBuyer.id,
        }),
    ]);

    return context;
  };
};
