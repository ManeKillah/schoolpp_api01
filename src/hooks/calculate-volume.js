// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { getItems, replaceItems } = require("feathers-hooks-common");

// eslint-disable-next-line no-unused-vars
module.exports = ({ heigh, long, width }) => {
  return async (context) => {
    let records = getItems(context);

    let volume = (long / 100) * (heigh / 100) * (width / 100);

    volume = volume / 1000 < 1 ? 1 : volume / 1000;
    return volume;
  };
};
