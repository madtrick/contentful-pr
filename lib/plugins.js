'use strict';

var Promise    = require('bluebird');
var Iterator   = require('es6-iterator');
var compact    = require('lodash.compact');
var flatten    = require('lodash.flatten');
var isObject   = require('lodash.isobject');
var isFunction = require('lodash.isfunction');

var plugins;

module.exports = {
  init              : init,
  cliOptions        : cliOptions,
  triggerPluginsForHook : triggerPluginsForHook
};

function init (pluginsConfig) {
  plugins = pluginsConfig.map( function (plugin) {
    var pluginInstance;

    if (isObject(plugin)) {
      pluginInstance =  require(plugin.package);

      if (isFunction(pluginInstance.setup)) {
        pluginInstance.setup(plugin.config);
      }
    } else {
      pluginInstance = require(plugin);
    }

    return pluginInstance;
  });
}

function cliOptions () {
  return flatten(compact(
    plugins.map( function (plugin) {
      return plugin.cliOptions;
    })
  ));
}

function triggerPluginsForHook (hookName, data) {
  return new Promise( function (resolve) {
    var pluginsIterator = new Iterator(plugins);
    runPlugins(pluginsIterator, hookName, resolve, data);
  });
}

function runPlugins (pluginsIterator, hookName, resolve, data) {
  var next      = pluginsIterator.next();
  var plugin;

  if (next.done) {
    resolve(data);
  } else {
    plugin = next.value;

    if (plugin[hookName]) {
      plugin[hookName](data)
      .then( function (newData) {
        runPlugins(pluginsIterator, hookName, resolve, newData);
      });
    } else {
      runPlugins(pluginsIterator, hookName, resolve, data);
    }
  }
}
