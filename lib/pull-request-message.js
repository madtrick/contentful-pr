'use strict';

var fs      = require('fs');
var path    = require('path');
var Promise = require('bluebird');
var temp    = require('temp');
var editor  = require('editor');

module.exports = prMessage;
function prMessage (template, tpTicket) {
  temp.track();

  return function () {
    return new Promise( function (resolve) {
      fs.readFile(path.resolve(template), function (err, templateData) {
        temp.open(null, function (err, info) {
          var templateString = templateData.toString();
          var message        = templateString.replace(/:tp-ticket-id:/g, tpTicket);

          var data = [
            '\n',
            message
          ];

          fs.writeFile(info.path, data.join(''), function () {
            editor(info.path, function () {
              fs.readFile(info.path, function (error, data) {
                var message = data.toString();
                var lines   = message.split('\n');
                var title   = lines[0];
                var body    = lines.slice(1, lines.length - 1).join('\n');

                resolve({title: title, body: body});
              });
            });
          });
        });
      });
    });
  };
}
