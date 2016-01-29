'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-lirc.Receive');
const utils  = require('./utils');

module.exports = class Receive {
  constructor(config) {

    this._remote = config.remote;
    this._button = config.button;
    this._repeats = !!config.repeats;

    this.online  = 'off';
    this.value = 'off';

    try {
      this.lirc = utils.createLirc(config, logger);

      this.lirc.on('connect', () => this.online = 'on');
      this.lirc.on('error',   () => this.online = 'off');

      this.lirc.on('receive', this._trigger.bind(this));

    } catch(err) {
      logger.error(`error creating receive : ${err}`);
    }
  }

  _trigger(remote, button, repeat) {
    logger.debug(`received: remote='${remote}', button='${button}', repeat='${repeat}'`);

    if(remote !== this._remote || buton !== this._button) { return; }
    if(repeat !== 0 && !this._repeats) { return; }

    this.value = 'on';
    this.value = 'off';
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