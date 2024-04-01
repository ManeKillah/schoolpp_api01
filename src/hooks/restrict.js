const { NotAuthenticated } = require("@feathersjs/errors")

module.exports = () => () => {
    throw new NotAuthenticated('Method not allowed')
}