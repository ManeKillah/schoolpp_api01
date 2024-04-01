const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    let { user } = context.params;
    let records = getItems(context);

    // console.log(66, 88);

    // if (!records.reference) records.reference = generateReference(7);

    if (records.user_id) {
      const userService = await context.app.service('users');
      const user = await userService.get(Number(records.user_id));
      records.user_name = user.first_name;
      records.user_email = email;
      // console.log(records, records.container_name);
    }

    if (records.observations) {
      const currentDate = new Date();
      const observationsService = await context.app.service('observations');
      const createObservaData = {
        message: records.observations,
        creation_date: currentDate.toISOString(),
        reference: records.reference_pre,
      };
      await observationsService.create(createObservaData);
    }
    delete records.observations;
    if (records.fileImage) delete records.fileImage;

    // console.log(55, records?.fileImage['0']);
    replaceItems(context, records);
    return context;
  };
};
