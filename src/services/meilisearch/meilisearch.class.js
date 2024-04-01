
class Meilisearch {
  constructor(options = {}, app) {
    this.options = options
    this.app = app
  }


  // eslint-disable-next-line no-unused-vars
  async find(params) {
    return []
  }

  // eslint-disable-next-line no-unused-vars
  async get(id, params) {
    return {
      id,
      text: `A new message with ID: ${id}!`,
    }
  }


  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  // eslint-disable-next-line no-unused-vars
  async update(id, data, params) {
    return data
  }

  // eslint-disable-next-line no-unused-vars
  async patch(id, data, params) {
    return data
  }

  // eslint-disable-next-line no-unused-vars
  async remove(id, params) {
    return { id }
  }
}

module.exports = { Meilisearch }
