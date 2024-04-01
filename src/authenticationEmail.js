const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAcceptable, NotAuthenticated } = require('@feathersjs/errors');
const { customAlphabet } = require('nanoid');
const { sendTokenEmail } = require('./sendAuthNotification');
const customResponse = require('./hooks/customResponse');

class EmailStrategy extends LocalStrategy {
  constructor(app) {
    super();
    this.app = app;
  }

  async authenticate(authentication, params) {
    const { entity } = this.configuration;
    const records = authentication;
    const UserModel = this.app.service('users').getModel().query();

    if (!records.email) throw new NotAcceptable('Debes enviar tu email.');
    if (records.strategy !== 'email') return context;

    const user = await UserModel.whereIn('status', [
      'active',
      'inactive',
      'pending_information',
      'pending_verification',
    ])
      .where({
        email: records.email,
        // deletedAt: null,
      })
      .then((it) => it[0]);

    if (user && (user.status == 'inactive' || user.deletedAt !== null))
      throw new NotAcceptable(
        'Tu cuenta está suspendida, contacta al administrador.'
      );

    const token = await customAlphabet('123456789', 4)();
    let dataNotification = null;

    if (!user) {
      records.otp_code = token;
      // console.log('code', otp_code);
      let currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() + 10);

      records.otp_expiry = currentDate.toISOString();
      records.status = 'pending_verification';

      records.strategy ? delete records.strategy : null;
      const userCreated = await UserModel.insert(records);

      delete userCreated.otp_code;

      //enviar correo
      dataNotification = {
        type: 'email',
        user: { ...userCreated },
        typeNotification: 'loginEmail',
        token: token,
      };

      await this.app.service('send-notifications').create(dataNotification);

      throw new customResponse(
        'send-token',
        'se envió el token por medio de un email.',
        200,
        'customResponse'
      );
    } else if (user && !records.otp_code) {
      let currentDate = new Date();
      // Sumar 10 minutos a la fecha actual
      currentDate.setMinutes(currentDate.getMinutes() + 10);

      await UserModel.patch({
        otp_code: token,
        otp_expiry: currentDate.toISOString(),
      }).where({ id: user.id });

      dataNotification = {
        type: 'email',
        user: { ...user },
        typeNotification: 'loginEmail',
        token: token,
      };

      await this.app.service('send-notifications').create(dataNotification);

      throw new customResponse(
        'send-token',
        'se envió el token por medio de un email.',
        200,
        'customResponse'
      );
    }

    const currentUser = await this.app
      .service('users')
      .find({
        query: {
          email: records.email,
          // otp_code: records.otp_code,
        },
        paginate: false,
      })
      .then((res) => res[0]);

    if (!currentUser) {
      throw new NotAuthenticated(
        `El email '${records.email} no se encuentra registrado.'`
      );
    }

    const currentDate = new Date();

    if (currentUser.otp_expiry >= currentDate.toISOString()) {
      await UserModel.patch({
        otp_expiry: null,
        otp_code: null,
      }).where({
        id: currentUser.id,
      });

      throw new NotAuthenticated(
        'El tiempo limite del codigo ha vencido, por favor solicita un nuevo código.'
      );
    }

    console.log(currentUser, 'currentUsercurrentUser');
    if (currentUser.otp_code !== records.otp_code) {
      // await UserModel.patch({
      //   otp_retries: currentUser.otp_retries - 1,
      // }).where({
      //   id: currentUser.id,
      // });

      throw new NotAuthenticated('El código ingresado es incorrecto.');
    }

    delete currentUser.password;

    const updateData = {};

    if (
      records.current_device_os_version !==
      currentUser.current_device_os_version
    ) {
      updateData.current_device_os_version = records.current_device_os_version;
    }

    if (records.current_device_make !== currentUser.current_device_make) {
      updateData.current_device_make = records.current_device_make;
    }

    if (records.current_device_brand !== currentUser.current_device_brand) {
      updateData.current_device_brand = records.current_device_brand;
    }

    if (
      records.current_codepush_version !== currentUser.current_codepush_version
    ) {
      updateData.current_codepush_version = records.current_codepush_version;
    }

    if (records.current_device_id !== currentUser.current_device_id) {
      updateData.current_device_id = records.current_device_id;
    }

    if (records.current_firebase_token !== currentUser.current_firebase_token) {
      updateData.current_firebase_token = records.current_firebase_token;
    }

    if (records.current_apple_token !== currentUser.current_apple_token) {
      updateData.current_apple_token = records.current_apple_token;
    }

    if (
      currentUser.status === 'pending_verification' ||
      currentUser.status === 'pending_information'
    ) {
      await UserModel.patch({
        ...updateData,
        otp_code: null,
        otp_expiry: null,
        status:
          currentUser.first_name && currentUser.last_name && currentUser.email
            ? 'active'
            : 'pending_information',
      }).where({ id: user.id });
      currentUser.status =
        currentUser.first_name && currentUser.last_name && currentUser.email
          ? 'active'
          : 'pending_information';
    } else if (currentUser.status === 'inactive') {
      throw new Forbidden(
        'Tu usuario se encuentra inactivo. comunicate con el administrador'
      );
    } else {
      await UserModel.patch({
        ...updateData,
        otp_code: null,
        otp_expiry: null,
      }).where({ id: user.id });
    }

    // aqui vas a probar el token al principio te envian el token_login en null OJO

    return { authentication: { strategy: this.name }, [entity]: currentUser };
  }
}

module.exports = EmailStrategy;
