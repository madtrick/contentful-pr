'use strict';

var Promise     = require('bluebird');
var gitty       = require('gitty');
var GithubAPI   = require('github');
var tpAPI       = require('tp-api');
var logger      = require('./lib/logging').logger();
var Repository  = require('./lib/repository');
var PullRequest = require('./lib/pull-request');
var prMessage   = require('./lib/pull-request-message');

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
      prMessage(options.template, options.tp)
    ])
    .spread( function (branch, user, repo, message) {
      var pr   = new PullRequest(github, {
        base     : options.base,
        assignee : options.assignee,
        branch   : branch,
        user     : user,
        repo     : repo
      });

      createPullRequest(pr, message)
      .error(handle_cannotCreatePullRequest)
      .then(assignPullRequest)
      .then(commentOnTargetProcess(options.tp));
    });
  });
}

function createPullRequest (pullRequest, message) {
  return pullRequest.create({
    title: message.title,
    body: message.body
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

function assignPullRequest (pullRequest) {
  if (pullRequest.options.assignee) {
    return pullRequest.assign();
  } else {
    return Promise.resolve(pullRequest);
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
