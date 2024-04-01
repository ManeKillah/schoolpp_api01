const { NotAcceptable } = require('@feathersjs/errors');
const inside = require('point-in-polygon');

// eslint-disable-next-line no-unused-vars
module.exports = (
  fulfillment_company_id,
  totalWeight,
  volume,
  address,
  fulfillmentCompanyServiceCode,
  declared_value,
  units,
  fulfillmentType
) => {
  return async (context) => {
    let fulfillment_company_meta_data = {};
    const FULFILLMENT_COMPANY_ENVIA_COLVANES_ID = 2;
    const FULFILLMENT_COMPANY_PICKGO = 5;
    if (fulfillment_company_id === FULFILLMENT_COMPANY_ENVIA_COLVANES_ID) {
      //BUSCAMOS EN ENVIA
      if (!fulfillmentCompanyServiceCode)
        throw new NotAcceptable('Debes enviar el codigo del servicio.');
      fulfillment_company_meta_data = await context.app
        .service('envia-colvanes')
        .create({
          action: 'find',
          destination_city: `${address.dane_code}`,
          city_origin: '08001',
          weight: totalWeight,
          volume,
          number_of_units: 1,
          declared_value,
          service_code: fulfillmentCompanyServiceCode,
          sendDescription: [2, 13].includes(fulfillmentCompanyServiceCode)
            ? 'Aereo'
            : 'Terrestre',
        })
        .then((it) => ({ ...it, price: it.valor_flete + it.valor_costom }))
        .catch((it) => console.log(it, 'ERROR BUSCANDO VALOR EN ENVIA'));
    } else if (fulfillment_company_id === FULFILLMENT_COMPANY_PICKGO) {
      fulfillment_company_meta_data = {
        price: 0,
      };
    } else {
      const valueByUnity = {
        weight: totalWeight,
        units,
        price: declared_value,
        volume,
      };
      if (fulfillmentType !== 'polygon') {
        fulfillment_company_meta_data = await context.app
          .service('fulfillment-matrix')
          .getModel()
          .query()
          .select(
            'fulfillment_matrix.*',
            'locations_cities.name AS city_name',
            'fulfillment_company.name AS fulfillment_company_name '
          )
          .innerJoin(
            'locations_cities',
            'fulfillment_matrix.destination_city_id',
            '=',
            'locations_cities.id'
          )
          .innerJoin(
            'fulfillment_company',
            'fulfillment_matrix.fulfillment_company_id',
            '=',
            'fulfillment_company.id'
          )
          .where({
            fulfillment_company_id: fulfillment_company_id,
            'fulfillment_matrix.type': fulfillmentType,
            'fulfillment_matrix.deletedAt': null,
          })
          .where('min', '<=', valueByUnity[fulfillmentType])
          .where('max', '>=', valueByUnity[fulfillmentType])
          .then((it) => it[0]);
      } else {
        const coordinate = [address.lat, address.lng];
        let shippingCostSelect = null;

        const shippingCosts = await context.app
          .service('shipping-costs')
          .getModel()
          .query()
          .select(
            'fulfillment_company.*',
            'shipping_costs.price',
            'shipping_costs.polygon',
            'shipping_costs.name as shipping_cost_name',
            'fulfillment_company.id AS fulfillment_company_id',
            'fulfillment_company.name AS fulfillment_company_name'
          )
          .innerJoin(
            'fulfillment_company',
            'shipping_costs.fulfillment_company_id',
            '=',
            'fulfillment_company.id'
          )
          .where({
            'shipping_costs.deletedAt': null,
            'fulfillment_company.deletedAt': null,
            fulfillment_company_id: fulfillment_company_id,
          })
          .then((it) => it);

        for (let index = 0; index < shippingCosts.length; index++) {
          const shippingCost = shippingCosts[index];
          const ranges = JSON.parse(shippingCost.polygon);
          if (ranges.length >= 1) {
            const polygon = ranges.map((it) => [it.lat, it.lng]);

            if (inside(coordinate, polygon)) {
              shippingCostSelect = shippingCost;
              break;
            }
          }
        }

        fulfillment_company_meta_data = shippingCostSelect;
      }
    }

    if (!fulfillment_company_meta_data)
      throw new NotAcceptable('No se encontró la transportadora.');

    return fulfillment_company_meta_data;
  };
};
