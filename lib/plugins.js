'use strict';

var Iterator = require('es6-iterator');

var pluginsLoaded = [];

module.exports = {
  init     : init,
  iterator : iterator
};

function init (pluginsConfig) {
  pluginsConfig.forEach( function (plugin) {
    pluginsLoaded.push(require(plugin));
  });
}

function iterator () {
  return new Iterator(pluginsLoaded);
}
