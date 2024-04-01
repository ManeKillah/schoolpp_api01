module.exports = () => {
  return function getIp(req, res) {
    req.body.ip = req.ip;
    console.log(res);
    // req.feathers.ip = req.ip;
    // req.feathers.headers = req.headers;
    req.next();
  };
};
