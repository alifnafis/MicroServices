const express = require('express');
const ServiceRegistry = require('./lib/ServiceRegistry');

const service = express();

module.exports = (config) => {
  const log = config.log();
  const serviceRegistry = new ServiceRegistry(log);
  // Add a request logging middleware in development mode
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.put('/register/:servicename/:serviceversion/:serviceport', (req, res) => {
    const { servicename, serviceversion, serviceport } = req.params;

    const serviceip = req.socket.remoteAddress.includes('::') ? `[${req.socket.remoteAddress}]` : req.socket.remoteAddress;

    // eslint-disable-next-line max-len
    const serviceKey = serviceRegistry.register(servicename, serviceversion, serviceip, serviceport);

    return res.json({ result: serviceKey });
  });

  service.delete('/unregister/:servicename/:serviceversion/:serviceport', (req, res) => {
    const { servicename, serviceversion, serviceport } = req.params;

    const serviceip = req.socket.remoteAddress.includes('::') ? `[${req.socket.remoteAddress}]` : req.socket.remoteAddress;

    // eslint-disable-next-line max-len
    const serviceKey = serviceRegistry.unregister(servicename, serviceversion, serviceip, serviceport);

    return res.json({ result: `Deleted ${serviceKey}` });
  });

  service.get('/find/:servicename/:serviceversion', (req, res) => {
    const { servicename, serviceversion } = req.params;
    log.debug(servicename, serviceversion);
    const svc = serviceRegistry.get(servicename, serviceversion);
    if (!svc) return res.status(404).json({ result: 'service not found' });
    return res.json(svc);
  });

  service.use((error, res) => {
    res.status(error.status || 500);
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
