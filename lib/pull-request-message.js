'use strict';

var fs      = require('fs');
var path    = require('path');
var Promise = require('bluebird');
var temp    = require('temp');
var editor  = require('editor');

var plugins = require('./plugins');

module.exports = prMessage;
function prMessage (template, tpTicketId) {
  temp.track();

  return buildMessageForEditor(template, tpTicketId)
  .then(hookPlugins)
  .then(writeTemporaryFile)
  .then(launchEditor)
  .then(readPullRequestMessage);
}

function buildMessageForEditor (template, tpTicketId) {
  if (template) {
    return readMessageTemplate(template)
    .then(interpolateTargeProcessId(tpTicketId));
  } else {
    return Promise.resolve('');
  }
}

function readMessageTemplate (template) {
  var templatePath = path.resolve(template);

  return Promise.promisify(fs.readFile)(templatePath)
  .then( function (data) {
    return data.toString();
  });
}

function hookPlugins (data) {
  return new Promise( function (resolve) {
    var pluginsIterator = plugins.iterator();

    runPlugins(pluginsIterator, resolve, data);
  });
}

function runPlugins (pluginsIterator, resolve, data) {
  var next      = pluginsIterator.next();
  var plugin;

  if (next.done) {
    resolve(data);
  } else {
    plugin = next.value;

    if (plugin.preMessageHook) {
      plugin.preMessageHook(data)
      .then( function (d) {
        var newData = [d, '\n', data].join('');
        runPlugins(pluginsIterator, resolve, newData);
      });
    } else {
      runPlugins(pluginsIterator, resolve, data);
    }
  }
}

function interpolateTargeProcessId (targetProcessId) {
  return function (message) {
    var messageWithTargetProcessId = message.replace(/:tp-ticket-id:/g, targetProcessId);

    return Promise.resolve(messageWithTargetProcessId);
  };
}

function writeTemporaryFile (data) {
  return Promise.promisify(temp.open)(null)
  .then( function (info) {
    return Promise.promisify(fs.writeFile)(info.path, data)
    .then( function () {
      return info.path;
    });
  });
}

function launchEditor (path) {
  return new Promise(function (resolve) {
    editor(path, function (code) {
      if (code === 0) {
        resolve(path);
      }
    });
  });
}

function readPullRequestMessage (path) {
  return Promise.promisify(fs.readFile)(path)
  .then( function (data) {
    var message = data.toString();
    var lines   = message.split('\n');
    var title   = lines[0];
    var body    = lines.slice(1, lines.length - 1).join('\n');

    return {title: title, body: body};
  });
}
