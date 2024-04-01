const { PaymentError } = require('@feathersjs/errors');
const axios = require('axios');
const moment = require('moment');
const sha256 = require('sha256');

class Paymentez {
  constructor(paymentezCredentials, transactionsType) {
    this.paymentezCredentials = paymentezCredentials;
    const { in_test, url_test, url_production } = this.paymentezCredentials;
    const keyCredential =
      transactionsType === 'credit_card' ? 'api_credit_card' : 'api';

    this.baseUrl = in_test
      ? url_test[keyCredential]
      : url_production[keyCredential];
  }

  config(method, urlComplement, data = {}, type) {
    const authorization = this.createAuthorization(
      this.paymentezCredentials,
      type
    );
    this.headers = {
      'Auth-Token': `${authorization}`,
      'Content-Type': 'application/json',
    };

    return {
      method: method,
      url: `${this.baseUrl}/${urlComplement}`,
      headers: this.headers,
      data,
    };
  }

  createAuthorization(paymentezCredentials, type) {
    const { code_client, key_client, code_server, key_server } =
      paymentezCredentials;
    const unixTimestamp = moment().unix();

    const uniqTokenString = `${
      type === 'server' ? key_server : key_client
    }${unixTimestamp}`;

    const uniqTokenHash = sha256(uniqTokenString);

    return Buffer.from(
      `${
        type === 'server' ? code_server : code_client
      };${unixTimestamp};${uniqTokenHash}`
    ).toString('base64');
  }

  async createCreditCard(dataCreditCard, user) {
    const COMPLEMENT_URL = 'v2/card/add';
    const METHOD = 'post';

    const creditCard = {
      user: {
        id: `${user.id}`,
        email: user.email,
        phone: user.phone,
      },
      card: {
        number: dataCreditCard.masked_number,
        holder_name: dataCreditCard.owner_name,
        expiry_month: Number(dataCreditCard.exp_month),
        expiry_year: Number(dataCreditCard.exp_year),
        cvc: dataCreditCard.cvv,
      },
    };

    const config = this.config(METHOD, COMPLEMENT_URL, creditCard, 'client');

    return await axios(config)
      .then((response) => response.data)
      .catch((error) => {
        throw new PaymentError(error.response.data.error);
      });
  }

  async createPaymentCreditCard(token, dataOrder, user) {
    const METHOD = 'post';
    const COMPLEMENT_URL = 'v2/transaction/debit/';

    const paymentData = {
      user: {
        id: `${user.id}`, //QUITAR ESTE 14 DE AQUI
        email: user.email,
      },
      order: {
        amount: dataOrder.amount,
        description: 'pago en todo en soldaduras',
        dev_reference: `${dataOrder.order_id}-${moment().unix()}`,
        vat: dataOrder.vat,
      },
      card: {
        token: token,
      },
    };

    const config = this.config(METHOD, COMPLEMENT_URL, paymentData, 'server');

    return this.fetch(config);
  }

  async createPaymentPse({ dataOrder, userPay, config, user }) {
    const COMPLEMENT_URL = 'order/';
    const METHOD = 'post';

    const paymentData = JSON.stringify({
      carrier: {
        id: 'PSE',
        extra_params: {
          bank_code: config.bankCode,
          response_url: config.responseUrl,
          user: {
            name: `${userPay.name}`,
            fiscal_number: userPay.fiscalNumber,
            type:
              userPay.typePerson === 'natural' || userPay.typePerson === 'n'
                ? 'N'
                : 'N',
            type_fis_number: userPay.typeFisNumber,
          },
        },
      },
      user: {
        id: user.id,
        email: user.email,
      },
      order: {
        country: 'COL',
        currency: 'COP',
        dev_reference: `${dataOrder.order_id}-${moment().unix()}`,
        amount: parseFloat(dataOrder.amount),
        vat: parseFloat(dataOrder.total_tax),
        description: 'pago en todo en soldaduras',
      },
    });

    const configFetch = this.config(
      METHOD,
      COMPLEMENT_URL,
      paymentData,
      'server'
    );

    return await this.fetch(configFetch);
  }

  async fetch(config) {
    return await axios(config)
      .then((response) => response.data)
      .catch((error) => {
        throw new PaymentError(error.response.data.error);
      });
  }

  async getStatusTranfer({ transaction_id }) {
    const URL_COMPLEMENT = `pse/order/${transaction_id}`;

    const configFetch = this.config('get', URL_COMPLEMENT, {}, 'server');

    return await this.fetch(configFetch);
  }
}

module.exports = Paymentez;
