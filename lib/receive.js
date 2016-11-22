'use strict';

const log4js     = require('log4js');
const logger     = log4js.getLogger('core-plugins-hw-lirc');
const controller = require('./controller');

module.exports = class Receive {
  constructor(config) {

    this._remote  = config.remote;
    this._button  = config.button;
    this._repeats = !!parseInt(config.repeats);

    this.online   = 'off';
    this.value    = 'off';

    try {
      this._controller = controller.open(config);
      this._controller.on('online',  this._online.bind(this));
      this._controller.on('receive', this._trigger.bind(this));
    } catch(err) {
      logger.error('error creating receive:', err);
    }
    
    this._closing = false;
  }

  _online(value) {
    if(this._closing) { return; }
    this.online = value ? 'on' : 'off';
  }

  _trigger(remote, button, repeat) {
    if(this._closing) { return; }
    if(remote !== this._remote || button !== this._button) { return; }
    if(repeat !== 0 && !this._repeats) { return; }

    this.value = 'on';
    this.value = 'off';
  }

  close(done) {
    this._closing = true;
    controller.close(this._controller);
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
