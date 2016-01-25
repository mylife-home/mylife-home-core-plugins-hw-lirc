'use strict';

const lirc_node = require('lirc_node');

module.exports = {
  send           : lirc_node.irsend.send_once,
  addListener    : lirc_node.addListener,
  removeListener : lirc_node.removeListener
};
