const { NotAcceptable } = require("@feathersjs/errors")
const { getItems, replaceItems } = require("feathers-hooks-common")
const { default: slugify } = require("slugify")

module.exports = ({ keyName, keySlug = 'slug' }) => async (context) => {
  const record = getItems(context)

  if (!keyName) throw new NotAcceptable('KeyName is required.')

  if (record[keyName]) {
    const slugName = slugify(record[keyName].toLowerCase(), {
      remove: /[*+~.()/'"!:@]/g,
    })

    record[keySlug] += slugName
  }

  replaceItems(context, record)

  return context
}