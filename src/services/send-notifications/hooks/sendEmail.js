const { checkContext, getItems } = require('feathers-hooks-common');
const { SES } = require('aws-sdk');

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

    const user = records.user;

    // console.log(66, records);

    if (user?.rol === 'admin') {
      throw 'eres administrador, no puedes crear un nuevo usuario';
    }

    if (records.type !== 'email') return context;

    let params = {};

    const ses = new SES({
      region: 'us-east-1', // Update with your desired AWS region
    });

    switch (records.typeNotification) {
      case 'loginEmail':
        try {
          const emailParams = {
            Source: 'puntovirtual@camarabaq.org.co', // Replace with your sender email address
            Destination: {
              ToAddresses: [user.email], // Replace with the recipient's email address
            },
            Message: {
              Subject: {
                Data: `Codigo de acceso: ${records.token}`,
              },
              Body: {
                Html: {
                  Data: `
                    <div style="text-align: center; padding: 30px; font-size: 22px; background: #fafbfd;">
                    <img style="max-width: 300px;" src="https://ccbq-webapp-static.s3.amazonaws.com/logos/email-logo.png"/>
                    <div style="background: white; max-width: 700px; padding: 30px; margin: 0 auto;">
                      <p>¡Bienvenido al Punto Empresario Virtual!</p> 
                      <p>Tu código de acceso es</p> 
                      <h3 style="font-size: 30px; margin: 0;"><b>${records.token}</b></h3> 
                      <p>Con este número puedes ingresar a la subapp y disfrutar de todos los servicios que hemos preparado para ti.</p>
                      <p>Recuerda que este token es confidencial, por ende NO debes compartirlo y usarlo en la mayor brevedad posible.</p>
                      <p>¡Estamos #MásCercaDeTi!</p>
                    </div>
                    </div>
                  `,
                },
              },
            },
          };

          // Send the email using SES
          const sendEmailResponse = await ses.sendEmail(emailParams).promise();

          console.log('Correo electrónico enviado', sendEmailResponse);
        } catch (error) {
          console.error('Error al enviar el correo electrónico', error);
        }

        break;

      case 'userPendingSegurityVerification':
        params = {
          name: `${records.user.first_name} ${records.user.last_name}`,
        };

        emailClass
          .sendAll(
            records.user.email,
            'd-96e9a26956ca420cbd814f1242f0b934',
            params
          )
          .then((it) => console.log(it, 'enviado'));

        break;

      case 'userPendingSegurityVerificationAdmin':
        params = {
          name: `${records.user.first_name} ${records.user.last_name}`,
          email: `${records.user.email}`,
        };

        emailClass
          .sendAll(
            'servicliente@estrategias-ltda.com',
            'd-268293fd61dd40cf9351357670d98be3',
            params
          )
          .then((it) => console.log(it, 'enviado'));

        break;
      case 'userActive':
        params = {
          name: `${records.user.first_name} ${records.user.last_name}`,
        };

        emailClass
          .sendAll(
            records.user.email,
            'd-8baf19c705704fba82688bb04cbbb499',
            params
          )
          .then((it) => console.log(it, 'enviado'));

        break;

      case 'orderPendingShipping':
        params = {
          order: `${records.order.order_id}`,
        };

        emailClass
          .sendAll(
            'info@gruposandra.com',
            'd-29ea14e41ec54f31b80a6a48d512e89d',
            params
          )
          .then((it) => console.log(it, 'enviado'));

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
