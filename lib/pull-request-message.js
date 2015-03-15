'use strict';

var fs      = require('fs');
var path    = require('path');
var Promise = require('bluebird');
var temp    = require('temp');
var editor  = require('editor');

module.exports = prMessage;
function prMessage (template, tpTicketId) {
  temp.track();

  return readMessageTemplate(template)
  .then(interpolateTargeProcessId(tpTicketId))
  .then(writeTemporaryFile)
  .then(launchEditor)
  .then(readPullRequestMessage);
}

function readMessageTemplate (template) {
  var templatePath = path.resolve(template);

  return Promise.promisify(fs.readFile)(templatePath)
  .then( function (data) {
    return data.toString();
  });
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
