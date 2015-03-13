'use strict';

var Promise     = require('bluebird');
var gitty       = require('gitty');
var GithubAPI   = require('github');
var tpAPI       = require('tp-api');
var logger      = require('./lib/logging').logger();
var Repository  = require('./lib/repository');
var PullRequest = require('./lib/pull-request');
var prMessage   = require('./lib/pull-request-message');
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

  repo.push()
  .then( function () {
    Promise.all([
      repo.getCurrentBranchName(),
      repo.getRemoteOwnerName(),
      repo.getRemoteRepoName(),
      prMessage(options.template, options['tp-id'])
    ])
    .then(function (resolves) {
      var branch  = resolves[0];
      var user    = resolves[1];
      var repo    = resolves[2];
      var message = resolves[3];

      pr.create({
        title: message.title,
        body: message.body,
        user: user,
        repo: repo,
        base: 'master',
        head: branch
      })
      .then( function () {
              pr.assign({
                user: user,
                repo: repo,
                head: branch,
                number: pr.number,
                assignee: options.assignee
              });
            });
    });
  });
}
