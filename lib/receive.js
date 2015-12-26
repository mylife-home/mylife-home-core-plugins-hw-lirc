'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-lirc.Receive');
const lirc   = require('./lirc');

module.exports = class Receive {
  constructor(config) {

    this._remote = config.remote;
    this._button = config.button;

    this.value = 'off';

    try {
      this._listenerId = lirc.addListener(this._remote. this._button, this._trigger.bind(this));
      this._activated  = true;
    } catch(err) {
      this._activated = false;
      logger.error(`error creating receive : ${err}`);
    }

    this.online = this._activated ? 'on' : 'off';
  }

  _trigger(data) {
    logger.debug('received: ' + JSON.stringify(data));
    this.value = 'on';
    this.value = 'off';
  }

  close(done) {
    if(this._listenerId) {
      lirc.removeListener(this._listenerId);
    }
    setImmediate(done);
  }

  static metadata(builder) {
    const binary = builder.enum('off', 'on');

    builder.usage.driver();

    builder.attribute('online', binary);
    builder.attribute('value', binary);

    builder.config('remote', 'string');
    builder.config('button', 'string');
  }
};
