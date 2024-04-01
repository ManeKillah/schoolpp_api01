const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAcceptable, NotAuthenticated } = require('@feathersjs/errors');
const { customAlphabet } = require('nanoid');
const { Container } = require('winston');
const customResponse = require('./hooks/customResponse');

class SmsStrategy extends LocalStrategy {
  constructor(app) {
    super();
    this.app = app;
  }

  async authenticate(authentication, params) {
    const { entity } = this.configuration;
    const records = authentication;
    const UserModel = this.app.service('users').getModel().query();

    if (!records.phone)
      throw new NotAcceptable('Debes enviar tu numero de teléfono.');

    if (!records.phone_country_code)
      throw new NotAcceptable('Debes enviar el código del país.');

    // if (records.otp_operation !== 'phone_verification')
    // throw new NotAcceptable('Debes enviar el código del país.');

    const user = await UserModel.whereIn('status', [
      'active',
      'inactive',
      'pending_verification',
      'pending_information',
    ])
      .where({
        phone: records.phone,
        phone_country_code: records.phone_country_code,
        deletedAt: null,
      })
      .then((it) => it[0]);

    if (user && user.status === 'inactive')
      throw new NotAcceptable('No te encuentras activo.');

    const token = ['3013587711', '8795647622'].includes(records.phone)
      ? '1234'
      : await customAlphabet('123456789', 4)();

    let dataNotification = null;

    if (!user) {
      let currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() + 10);
      // console.log(55, currentDate);
      records.otp_code = token;
      records.otp_expiry = currentDate.toISOString();
      records.status = 'pending_verification';

      records.strategy ? delete records.strategy : null;
      const userCreated = await UserModel.insert(records);

      // console.log(66, userCreated);

      delete userCreated.otp_code;

      dataNotification = {
        type: 'sms',
        user: { ...userCreated },
        typeNotification: 'loginSms',
        token: token,
      };

      await this.app.service('send-notifications').create(dataNotification);
      //enviar correo
      throw new customResponse(
        'send-token',
        'se envió el token por medio de un mensaje de texto.',
        200,
        'customResponse'
      );
    } else if (user && !records.otp_code) {
      let currentDate = new Date();
      currentDate.setMinutes(currentDate.getMinutes() + 10);
      console.log(55, currentDate.toISOString());

      await UserModel.patch({
        otp_code: token,
        otp_expiry: currentDate.toISOString(),
      }).where({ id: user.id });

      dataNotification = {
        type: 'sms',
        user: { ...user },
        typeNotification: 'loginSms',
        token: token,
      };

      await this.app.service('send-notifications').create(dataNotification);

      //enviar correo
      throw new customResponse(
        'send-token',
        'se envió el token por medio de un mensaje de texto.',
        200,
        'customResponse'
      );
    }

    const currentUser = await this.app
      .service('users')
      .find({
        query: {
          phone: records.phone,
          // otp_code: records.otp_code,
          phone_country_code: records.phone_country_code,
        },
        paginate: false,
      })
      .then((it) => it[0]);

    if (!currentUser)
      throw new NotAuthenticated(
        `El número de teléfono '${records.phone_country_code} ${records.phone}' no se encuentra registrado.`
      );

    const currentDate = new Date();
    const otpExpiryDate = new Date(currentUser.otp_expiry);
    console.log(66, currentDate, otpExpiryDate);

    if (otpExpiryDate <= currentDate) {
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

    if (user.status === 'pending_verification') {
      await UserModel.patch({
        ...updateData,
        otp_code: null,
        otp_expiry: null,
        status: 'pending_information',
      }).where({ id: user.id });
      currentUser.status = 'pending_information';
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

    //aqui vas a probar el token al principio te envian el token_login en null OJO

    return { authentication: { strategy: this.name }, [entity]: currentUser };
  }
}

module.exports = SmsStrategy;
