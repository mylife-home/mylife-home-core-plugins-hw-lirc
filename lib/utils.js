'use strict';

const Lirc = require('./lirc-client');

module.exports = {

  createLirc : function(config, logger) {

    const netConfig = {};
    if(config.path) {
      netConfig.path = config.path;
    } else if(config.host) {
      netConfig.host = config.host;
      netConfig.port = config.port;
    } else {
      netConfig.path = '/var/run/lirc/lircd';
    }

    const lirc = new Lirc(netConfig);

    lirc.on('error', (err) => logger.error(`lirc error : ${err}`));

    return lirc;
  }
};
