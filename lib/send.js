'use strict';

const log4js     = require('log4js');
const logger     = log4js.getLogger('core-plugins-hw-lirc');
const controller = require('./controller');

module.exports = class Send {
  constructor(config) {

    this._remote = config.remote;
    this._button = config.button;

    this.online  = 'off';

    try {
      this._controller = controller.open(config);
      this._controller.on('online', this._online.bind(this));
    } catch(err) {
      logger.error('error creating send:', err);
    }

    this._closing = false;
  }

  _online(value) {
    if(this._closing) { return; }
    this.online = value ? 'on' : 'off';
  }

  action(arg) {
    if(this._closing) { return; }
    if(arg === 'off') { return; }

    this._controller.send(this._remote, this._button);
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
    builder.action('action', binary);

    builder.config('path', 'string');
    builder.config('host', 'string');
    builder.config('port', 'integer');

    builder.config('remote', 'string');
    builder.config('button', 'string');
  }
};
