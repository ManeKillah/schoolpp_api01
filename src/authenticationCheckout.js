const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAcceptable, NotAuthenticated } = require('@feathersjs/errors');
const { customAlphabet } = require('nanoid');
const customResponse = require('./hooks/customResponse');
const { omit } = require('lodash');

class CheckoutStrategy extends LocalStrategy {
  constructor(app) {
    super();
    this.app = app;

    app.get('/authentication/check-user', async (req, res) => {
      const { email } = req.query;
      const UsersModel = this.app.service('users').getModel().query();
      const user = await UsersModel.where({ email }).then((it) => it[0]);

      res.json({ exist: !!user });
    });
  }

  async authenticate(authentication, params) {
    const { entity } = this.configuration;
    const records = authentication;

    if (!records.email) throw new NotAcceptable('Debes enviar tu email.');

    const userService = await this.app.service('users');
    let user = await userService
      .find({ query: { email: records.email } })
      .then(({ data }) => data[0]);

    if (
      user &&
      !['pending_information', 'pending_validation'].includes(user.status)
    )
      throw new NotAcceptable('El usuario ya existe.');

    const userData = {
      first_name: records.first_name,
      last_name: records.last_name,
      email: records.email,
      phone: records.phone,
      phone_country_code: records.phone_country_code,
      status: 'active',
    };

    if (user) {
      user = await userService.patch(
        user.id,
        userData,
        omit({ ...params, [entity]: user }, 'provider')
      );
    } else {
      user = await userService.create(
        userData,
        omit({ ...params, [entity]: user }, 'provider')
      );
    }

    delete user.password;

    return { authentication: { strategy: this.name }, [entity]: user };

    // if (!records.token_login_email) {
    //   const token = customAlphabet('123456789', 4)();

    //   await this.app.service('users')
    //     .getModel()
    //     .query()
    //     .patch({ token_login_email: token, status: 'pending validation' })
    //     .where({ id: user.id });

    //   await this.app.service('send-notifications')
    //     .create({ type: 'email', user: { ...user }, typeNotification: 'loginEmail', token });

    //   throw new customResponse('send-token', 'se envió el token por medio de un email.', 200, 'customResponse');
    // }

    // user = (await this.app.service('users').getModel().query().where({ email: records.email }))[0];

    // if (user.status === 'pending validation') {
    //   await this.app.service('users').getModel().query()
    //     .patch({
    //       token_login_email: '', status: (user.first_name &&
    //         user.last_name &&
    //         user.dni &&
    //         user.email) ? 'active' : 'pending user data',
    //     })
    //     .where({ id: user.id });
    //   user.status = (user.first_name &&
    //     user.last_name &&
    //     user.dni &&
    //     user.email) ? 'active' : 'pending user data';
    // } else {
    //   await this.app.service('users').getModel().query()
    //     .patch({ token_login_email: '' })
    //     .where({ id: user.id });
    // }

    // delete user.password;

    // return { authentication: { strategy: this.name }, [entity]: user };
  }
}

module.exports = CheckoutStrategy;
