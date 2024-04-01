const { getItems, replaceItems } = require("feathers-hooks-common");
const { NotAcceptable } = require("@feathersjs/errors");

const validData = async (records, context) => {
  const { user } = context.params;
  const userCurrent = await context.app
    .service("users")
    .getModel()
    .query()
    .where({ email: records.email })
    .whereNot("id", user.id)
    .then((it) => it[0]);

  if (userCurrent)
    throw new NotAcceptable(`Ya existe el "correo electronico."`);
};

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    let records = getItems(context);

    if (context.params.owner_company) return context;

    const { user } = context.params;
    let company = null;
    let tercero = null;

    //aqui vaidar que el email no exista
    const companyModel = context.app.service("companies").getModel();
    if (records.nit && user.status !== "active") {
      company = await companyModel
        .query()
        .where({ nit: records.nit, deletedAt: null })
        .then((it) => it[0]);

      tercero = await context.app
        .service("integrations-terceros")
        .getModel()
        .query()
        .where({ nit: records.nit, deletedAt: null })
        .then((it) => it[0]);

      if (company || tercero) {
        if (!company) {
          await validData(records, context);

          company = await companyModel.query().insert({
            name: records.company_name,
            nit: records.nit,
            dni_digit: records.dni_digit,
            autoretenedor: records.autoretenedor,
            gran_contribuyente: records.gran_contribuyente,
          });
        }

        context.company = company;
        records.status = "pending security verification";
        records.person_type = "legal";
        records.company_id = company.id;
      }

      if (!company && !tercero) {
        if (!records.company_name || !records.nit)
          throw new NotAcceptable("Debes enviar el nombre de la empresa.");

        await validData(records, context);

        company = await companyModel.query().insert({
          name: records.company_name,
          nit: records.nit,
          dni_digit: records.dni_digit,
          autoretenedor: records.autoretenedor,
          gran_contribuyente: records.gran_contribuyente,
        });

        records.person_type = "legal";
        records.status = "active";
        records.company_id = company.id;
        records.role = "user";
        records.owner_company = "true";
      }
    } else if (records.dni) {
      company = await companyModel
        .query()
        .where({ nit: records.dni, deletedAt: null })
        .then((it) => it[0]);

      await validData(records, context);

      if (company) {
        //CREAMOS AL USUARIO
        delete records.company_name;
        delete records.nit;
        delete records.dni_digit;
        delete records.autoretenedor;
        delete records.gran_contribuyente;

        // hay revisar esa jugada deveria ser un patch

        await context.app
          .service("users")
          .getModel()
          .query()
          .patch({
            ...records,
            status: "pending security verification",
            company_id: company.id,
          })
          .where("id", user.id);

        const dataNotification = {
          type: "email",
          user: { ...user },
          name: `${user.first_name} ${user.last_name}`,
          typeNotification: "userPendingSegurityVerification",
        };

        const dataNotificationAdmin = {
          type: "email",
          user: { ...user },
          name: `${user.first_name} ${user.last_name}`,
          typeNotification: "userPendingSegurityVerificationAdmin",
        };

        await Promise.all([
          context.app
            .service("send-notifications")
            .create(dataNotificationAdmin),
          context.app.service("send-notifications").create(dataNotification),
        ]);

        throw new NotAcceptable(
          "Ya existe una empresa con ese numero de documento, tu cuenta quedo en proceso de verificación y te notificaremos una vez haya sido activada."
        );
      } else {
        company = await companyModel.query().insert({
          name: `${records.first_name} ${records.last_name}`,
          nit: records.dni,
        });
      }

      records.person_type = "natural";
      records.status = "active";
      records.company_id = company.id;
      records.role = "user";
    }

    records.company_name ? delete records.company_name : null;
    records.nit ? delete records.nit : null;
    records.dni_digit ? delete records.dni_digit : null;
    records.autoretenedor ? delete records.autoretenedor : null;
    records.gran_contribuyente ? delete records.gran_contribuyente : null;

    replaceItems(context, records);

    return context;
  };
};
