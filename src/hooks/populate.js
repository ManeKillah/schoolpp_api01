const { fastJoin } = require('feathers-hooks-common')

module.exports = () => async (ctx) => {
  if (!ctx.params.joins) return ctx
  const joins = ctx.params.joins
  if (!Array.isArray(joins) || !joins.length) return ctx

  return fastJoin({
    joins: joins.reduce((acc, join) => {
      acc[join.fieldName] = () => async (item, context) => {
        if (item[join.fk]) {
          // eslint-disable-next-line require-atomic-updates
          item[join.fieldName] = await context.app.service(join.service).getModel()
            .query()
            .where({
              [join.pk]: item[join.fk]
            })
            .then((it) => join.type === 'many' ? it : it[0])
        }
      }
      return acc
    }, {})
  })(ctx)

}