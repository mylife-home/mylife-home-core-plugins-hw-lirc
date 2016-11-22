'use strict';

const log4js       = require('log4js');
const logger       = log4js.getLogger('core-plugins-hw-lirc');
const EventEmitter = require('events');
const Lirc         = require('lirc-client');

const repository = new Map();

class Controller extends EventEmitter {

  constructor(config, key) {
    super();

    this.config = config;
    this.key = key;
    this.usage = 0;

    logger.info(`${this.key}: lirc connecting to :`, this.config);
    this.controller = new Lirc(this.config);

    this.controller.on('connect',    this._connect.bind(this));
    this.controller.on('disconnect', this._disconnect.bind(this));
    this.controller.on('error',      this._error.bind(this));
    this.controller.on('receive',    this._receive.bind(this));
  }

  ref() {
    ++this.usage;
  }

  unref() {
    return !!(--this.usage);
  }

  close() {
    this.controller.close();
  }

  send(remote, button) {
    logger.info(`${this.key}: sending: SEND_ONCE remote='${remote}', button='${button}'`);
    this.controller.cmd('SEND_ONCE', remote, button, (err) => {
      if(err) {
        return logger.error(`${this.key}: error sending to lirc: ${err}`);
      }
    });
  }

  _receive(remote, button, repeat) {
    logger.info(`${this.key}: received: remote='${remote}', button='${button}', repeat='${repeat}'`);
    this.emit('receive', remote, button, repeat);
  }

  _connect() {
    logger.info(`${this.key}: lirc connected`);
    this.emit('online', true);
  }

  _disconnect() {
    logger.info(`${this.key}: lirc disconnected`);
    this.emit('online', false);
  }

  _error(reason) {
    logger.info(`${this.key}: lirc error: ${reason}`);
    switch(reason) {
      case 'end':
      case 'timeout':
        this.emit('online', false);
        break;
    }
  }
}

module.exports.open = (config) => {

  const controllerConfig = {};
  if(config.path) {
    controllerConfig.path = config.path;
  } else if(config.host) {
    controllerConfig.host = config.host;
    controllerConfig.port = config.port || 8765;
  } else {
    controllerConfig.path = '/var/run/lirc/lircd';
  }

  const key = controllerConfig.path || `${controllerConfig.host}:${controllerConfig.port}`;

  let controller = repository.get(key);
  if(!controller) {
    repository.set(key, (controller = new Controller(controllerConfig, key)));
  }
  controller.ref();
  return controller;

};

module.exports.close = (controller) => {
  if(controller.unref()) {
    return;
  }

  repository.delete(controller.key);
  return controller.close();
};
