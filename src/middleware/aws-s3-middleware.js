const s3router = require('react-s3-uploader/s3router');

module.exports = () => {
  return function awsS3Middleware(...params) {
    const [req] = params;
    return s3router({
      bucket: 'sudapp-static',
      region: 'us-east-1',
      signatureVersion: 'v4',
      headers: {
        // 'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'X-Requested-With,Content-Type,Cache-Control',
      },
      ACL: 'public-read',
      uniquePrefix: true,
    })(...params);
  };
};
