'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-lirc.Receive');
const utils  = require('./utils');

module.exports = class Receive {
  constructor(config) {

    this._remote  = config.remote;
    this._button  = config.button;
    this._repeats = !!parseInt(config.repeats);

    this.online   = 'off';
    this.value    = 'off';

    try {
      this.lirc = utils.createLirc(config, logger);

      this.lirc.on('connect', this._connect.bind(this));
      this.lirc.on('error',   this._error.bind(this));
      this.lirc.on('receive', this._trigger.bind(this));

    } catch(err) {
      logger.error(`error creating receive : ${err}`);
    }
  }

  _trigger(remote, button, repeat) {
    if(remote !== this._remote || button !== this._button) { return; }

    logger.info(`received: remote='${remote}', button='${button}', repeat='${repeat}'`);
    if(repeat !== 0 && !this._repeats) { return; }

    this.value = 'on';
    this.value = 'off';
  }

  _connect() {
    logger.info(`Connected to lirc`);
    this.online = 'on';
  }

  _error(err) {
    logger.info(`Lirc error: ${err}`);
    this.online = 'off';
  }

  close(done) {
    this.lirc.close();
    setImmediate(done);
  }

  static metadata(builder) {
    const binary = builder.enum('off', 'on');

    builder.usage.driver();

    builder.attribute('online', binary);
    builder.attribute('value', binary);

    builder.config('path', 'string');
    builder.config('host', 'string');
    builder.config('port', 'integer');

    builder.config('remote', 'string');
    builder.config('button', 'string');
    builder.config('repeats', 'integer'); // 1=repeats are on, 0=repeats or off (only the first msg is triggered)
  }
};
