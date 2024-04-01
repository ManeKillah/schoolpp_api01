const { getItems, replaceItems } = require('feathers-hooks-common');

module.exports = () => {
  return async (context) => {
    let { user } = context.params;
    let records = getItems(context);

    // console.log(66, 88);

    // if (!records.reference) records.reference = generateReference(7);

    if (records.project_id) {
      const projectService = await context.app.service('project');
      const project = await projectService.get(Number(records.project_id));
      records.project_name = project.name;
      // console.log(records, records.container_name);
    }
    if (records.store_id) {
      const storeService = await context.app.service('store');
      const store = await storeService.get(Number(records.store_id));
      records.store_name = store.name;
      // console.log(records, records.container_name);
    }
    if (records.equipment_id) {
      const containerService = await context.app.service('equipment');
      const equipment = await containerService.get(
        Number(records.equipment_id)
      );
      records.equipment_name = equipment.reference;
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
