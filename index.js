'use strict';

var Promise     = require('bluebird');
var gitty       = require('gitty');
var GithubAPI   = require('github');
var editor      = require('editor');
var temp        = require('temp');
var fs          = require('fs');
var path        = require('path');
var tpAPI       = require('tp-api');
var logger      = require('./lib/logging').logger();
var Repository  = require('./lib/repository');
var PullRequest = require('./lib/pull-request');
var revalidator = require('revalidator');

var github, targetprocess;

module.exports = run;
function run (config, options) {
  var prOptions = {
    base     : options.base || 'master',
    assignee : options.assignee
  };

  var validationResult = revalidator.validate(config, {
    properties: {
      credentials : {
        type: 'object',
        required: true,
        properties : {
          github: {
            type: 'object',
            require: true,
            properties: {
              type: {
                type: 'string',
                required: true
              },
              token : {
                type: 'string',
                required: true
              }
            }
          },
          targetprocess: {
            type: 'object',
            required: 'true',
            properties: {
              domain: {
                type: 'string',
                required: true
              },
              username: {
                type: 'string',
                required: true
              },
              password: {
                type: 'string',
                required: true
              }
            }
          }
        }
      }
    }
  });

  if (!validationResult.valid) {
    logger.error('Some of the configuration parameters are invalid');
    return;
  }

  github = new GithubAPI({ version: '3.0.0' });
  github.authenticate(config.credentials.github);

  targetprocess = tpAPI(config.credentials.targetprocess);

  var pr   = new PullRequest(github, prOptions);
  var repo = new Repository(gitty);

  repo
  .setup()
  .bind(repo)
  .then(repo.push)
  .bind(pr)
  .then(pr.setupRepo)
  .then(prMessage(options.template, options['tp-id']))
  .then(pr.create)
  .then(pr.assign)
  .then(function (pr) {
    if (!options['tp-id']) {
      return;
    }

    var comment = 'Created Pull Request ' + pr.url;
    targetprocess().comment(options['tp-id'], comment, function (error) {
      if (error) {
        logger.log(error);
      }
    });
  });
}

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
