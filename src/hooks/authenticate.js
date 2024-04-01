const { authenticate } = require('@feathersjs/authentication').hooks;
const { NotAuthenticated } = require('@feathersjs/errors');
const verifyIdentity = authenticate('jwt');

function hasToken(hook) {
  if (hook.params.headers == undefined) return false;

  if (hook.path == 'v-cartera-edades') return false;
  if (hook.data == undefined) return false;
  return hook.params.headers.authorization || hook.data.accessToken;
}

module.exports = async function authenticate(hook) {
  try {
    // console.log(111111);
    return await verifyIdentity(hook);
  } catch (error) {
    // console.log(22, error);
    if (error instanceof NotAuthenticated && !hasToken(hook)) {
      return hook;
    }

    throw error;
  }
};
