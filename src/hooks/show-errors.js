// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {

    console.error(`Error in ${context.path} calling ${context.method}  method`, context.error.stack);

    return context;
  };
};
