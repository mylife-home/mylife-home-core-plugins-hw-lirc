'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-lirc.Send');
const utils  = require('./utils');

module.exports = class Send {
  constructor(config) {

    this._remote = config.remote;
    this._button = config.button;

    this.online  = 'off';

    try {
      this.lirc = utils.createLirc(config, logger);

      this.lirc.on('connect', () => this.online = 'on');
      this.lirc.on('error',   () => this.online = 'off');

    } catch(err) {
      logger.error(`error creating send : ${err}`);
    }
  }

  action(arg) {
    if(arg === 'off') { return; }
    if(this.online  === 'off') {
      logger.error(`cannot send to lirc while disonnected`);
      return;
    }

    this.lirc.send(this._remote, this._button, (err) => {
      if(err) {
        return logger.error(`error sending to lirc: ${err}`);
      }
    });
  }

  close(done) {
    this.lirc.close();
    setImmediate(done);
  }

  static metadata(builder) {
    const binary = builder.enum('off', 'on');

    builder.usage.driver();

    builder.attribute('online', binary);
    builder.action('action', binary);

    builder.config('path', 'string');
    builder.config('host', 'string');
    builder.config('port', 'integer');

    builder.config('remote', 'string');
    builder.config('button', 'string');
  }
};