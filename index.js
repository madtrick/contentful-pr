'use strict';

var Promise     = require('bluebird');
var gitty       = require('gitty');
var GithubAPI   = require('github');
var tpAPI       = require('tp-api');
var logger      = require('./lib/logging').logger();
var Repository  = require('./lib/repository');
var PullRequest = require('./lib/pull-request');
var prMessage   = require('./lib/pull-request-message');
var plugins     = require('./lib/plugins');

var github, targetprocess;

module.exports = run;
function run (config, options) {
  github = new GithubAPI({ version: '3.0.0' });
  github.authenticate(config.credentials.github);
  targetprocess = tpAPI(config.credentials.targetprocess);

  var repo = new Repository(gitty);

  repo.push()
  .then( function () {
    Promise.all([
      repo.getCurrentBranchName(),
      repo.getRemoteOwnerName(),
      repo.getRemoteRepoName(),
      prMessage(options)
    ])
    .spread( function (branch, user, repoName, message) {
      options.pr = {
        message : message
      };

      options.repo = {
        branch : branch,
        user   : user,
        name   : repoName
      };

      var pr   = new PullRequest(github, {
        base     : options.cli.base,
        assignee : options.cli.assignee,
        branch   : options.repo.branch,
        user     : options.repo.user,
        repo     : options.repo.name
      });

      var context = {
        pr: pr,
        options: options
      };

      createPullRequest(context)
      .error(handle_cannotCreatePullRequest)
      .then(assignPullRequest);
    });
  });
}

function createPullRequest (context) {
  return context.pr.create({
    title : context.options.pr.message.title,
    body  : context.options.pr.message.body
  });
}

function handle_cannotCreatePullRequest (exception) {
  var exceptionBody = JSON.parse(exception.message);

  logger.error('Can\'t create pull request:');
  exceptionBody.errors.forEach(function (error) {
    logger.error('\t*', error.message, '\n');
  });

  process.exit(1);
}

function assignPullRequest (context) {
  if (context.options.assignee) {
    return context.pr.assign();
  } else {
    return Promise.resolve(context);
  }
}

function commentOnTargetProcess (tpEntityId) {
  if (!tpEntityId) {
    return function () {};
  }

  return function (pullRequest) {
    var comment = 'Submitted Pull Request ' + pullRequest.url;
    targetprocess().comment(tpEntityId, comment, function (error) {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Commented on Target Process entity #', tpEntityId);
      }
    });
  };
}
