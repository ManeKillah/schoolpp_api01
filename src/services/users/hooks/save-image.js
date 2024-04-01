const { getItems, replaceItems } = require('feathers-hooks-common');
function generateReference(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let reference = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reference += characters.charAt(randomIndex);
  }

  return reference;
}

module.exports = () => {
  return async (context) => {
    let { user } = context.params;
    let records = getItems(context);

    console.log(66, 88);

    if (!records.reference) records.reference = generateReference(7);

    if (records.observations) {
      const currentDate = new Date();
      const observationsService = await context.app.service('observations');
      const createObservaData = {
        message: records.observations,
        creation_date: currentDate.toISOString(),
        reference: records.reference,
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
