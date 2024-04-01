const { checkContext, getItems } = require('feathers-hooks-common');
const AWS = require('aws-sdk');
module.exports = function (options = {}) {
  return async (context) => {
    checkContext(context, null, [
      'find',
      'get',
      'create',
      'update',
      'patch',
      'remove',
    ]);

    const records = getItems(context);

    const { user } = context.params;

    if (records.type !== 'sms') return context;

    switch (records.typeNotification) {
      case 'loginSms':
        var params = {
          Message: `El código es ${records.token}. Este token te permite ingresar a tu cuenta de SudApp. No lo compartas.`,
          PhoneNumber: `${records.user.phone_country_code}${records.user.phone}`,
          MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'subapp',
            },
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional',
            },
          },
        };

        var publishTextPromise = new AWS.SNS({
          apiVersion: '2010-03-31',
          region: 'us-east-1',
        })
          .publish(params)
          .promise();

        await publishTextPromise
          .then((data) => {
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });

        break;

      default:
        break;
    }
    return context;
  };
};

function error(msg) {
  throw new Error(msg);
}
