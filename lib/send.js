'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('core-plugins-hw-lirc.Send');
const lirc   = require('./lirc');

module.exports = class Send {
  constructor(config) {

    this._remote = config.remote;
    this._button = config.button;

    this.value = 'off';
  }

  action(arg) {
    if(arg === 'off') { return; }
    lirc.send(this._remote, this._button, (err, stdout, stderr) => {
      if(err) {
        return logger.error(`error sending to lirc: ${err} (stderr=${stderr})`);
      }
      const error = stderr.toString();
      if(error) {
        return logger.error(`error sending to lirc: ${error}`);
      }
    });
  }

  //close(done)

  static metadata(builder) {
    const binary = builder.enum('off', 'on');

    builder.usage.driver();

    builder.attribute('action', binary);

    builder.config('remote', 'string');
    builder.config('button', 'string');
  }
};
