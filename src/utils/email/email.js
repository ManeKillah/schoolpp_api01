const { GeneralError } = require('@feathersjs/errors');
const sgMail = require('@sendgrid/mail');

class Email {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  sendRaw(...options) {
    return sgMail.send(...options);
  }

  sendAll(to, template, params = {}) {
    let _to = to;

    if (!to) {
      throw new GeneralError('var "to" cannot be undefined');
    }

    if (!template) {
      throw new GeneralError('var "template" cannot be undefined');
    }

    if (!Array.isArray(_to)) {
      _to = [_to];
    }

    return this.sendRaw({
      to: _to,
      from: 'Almacén Sandra <info@gruposandra.com>',
      templateId: template,
      dynamic_template_data: params,
    });
  }

  sendOne(email, ...params) {
    if (!email) {
      throw new GeneralError('var "email" cannot be undefined');
    }

    return this.sendAll([email], ...params);
  }
}

module.exports = Email;
