const { GeneralError } = require('@feathersjs/errors');
const { checkContext } = require('feathers-hooks-common')

const defaultQuery = { deleted: { $ne: true } };
const defaultData = { deleted: true };
const getValue = (value, ...args) => {
    if (typeof value === 'function') {
        return Promise.resolve(value(...args));
    }
    return Promise.resolve(value);
};

module.exports = ({
    deletedQuery = defaultQuery,
    removeData = defaultData
} = {}) => {
    return async context => {
        const { service, method, params, app } = context;
        const { disableSoftDelete, query = {} } = params;

        if (app.version < '4.0.0') {
            throw new GeneralError('The softDelete hook requires Feathers 4.0.0 or later');
        }

        checkContext(context, 'before', null, 'softDelete');

        if (disableSoftDelete) {
            return context;
        }

        const deleteQuery = await getValue(deletedQuery, context);

        context.params.query = Object.assign({}, query, deleteQuery);

        const pa = Object.assign({}, context.params.query, { disableSoftDelete: true })

        if (method === 'remove') {

            const data = await getValue(removeData, context);

            const result = await service.patch(context.id, data, pa);

            context.result = result;
        }

        return context;
    };
};
