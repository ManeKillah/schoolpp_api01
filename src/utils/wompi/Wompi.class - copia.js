const { GeneralError, NotAcceptable } = require('@feathersjs/errors')
const axios = require('axios')

module.exports = class Wompi {
    constructor(app) {
        const config = app.get('wompi')

        this.urlBase = config.url_base
        this.pubKey = config.public_key
        this.privKey = config.private_key
        this.eventsSecret = config.events_secret
        this.integritySecret = config.integrity_secret
        this.isTest = config.test
        this.fetch = this._configureAxios()
    }

    async tokenizeCard(payload) {
        const response = await this.fetch.post('/tokens/cards', payload, {
            headers: this._getHeaders({ token: this.pubKey })
        })
            .then(res => res.data)
            .catch(err => {
                throw new GeneralError(err.response.data)
            })
        return response
    }

    async createPaymentSource(payload) {
        const response = await this.fetch.post('/payment_sources',
            payload,
            {
                headers: this._getHeaders({ token: this.privKey })
            }
        ).then(res => res.data)
            .catch(err => {
                throw new GeneralError(err.response.data)
            })
        return response
    }

    async createTransaction(payload) {
        const response = await this.fetch.post('/transactions', payload, {
            headers: this._getHeaders({ token: this.privKey })
        })
            .then(res => res.data)
            .catch(err => {
                throw new NotAcceptable(err.response.data)
            })
        return response
    }

    async voidTransaction(transactionId, amount) {
        const response = await this.fetch.post(
            `/transactions/${transactionId}/void`,
            { amount_in_cents: amount },
            { headers: this._getHeaders({ token: this.privKey }) }
        ).then(res => res.data)
            .catch(err => {
                throw new NotAcceptable(err.response.data)
            })

        return response
    }

    async createMerchant() {
        return await this.fetch.get(`/merchants/${this.pubKey}`)
            .then(res => res.data)
            .catch(err => {
                throw new NotAcceptable(err.response.data)
            })
    }

    async getAcceptanceToken() {
        return await this.createMerchant()
            .then(res => res.data.presigned_acceptance.acceptance_token)
            .catch(() => undefined)
    }

    async getTransaction(id) {
        return await this.fetch.get(`/transactions/${id}`, {
            headers: this._getHeaders({ token: this.privKey })
        })
            .then(res => res.data)
            .then(res => res.data)
            .catch(err => {
                throw new NotAcceptable(err.response.data)
            })
    }

    async getPseBanks() {
        return await this.fetch.get(`/pse/financial_institutions`, {
            headers: this._getHeaders({ token: this.privKey })
        })
            .then(res => res.data)
            .then(res => res.data)
            .catch(err => {
                throw new NotAcceptable(err.response.data)
            })
    }

    _configureAxios() {
        const instance = axios.create({
            baseURL: this.urlBase,
        })
        return instance
    }

    _getHeaders({ token }) {
        return {
            Authorization: `Bearer ${token}`
        }
    }
}