'use strict';

var Promise = require('bluebird');
var logger  = require('./logging').logger();

module.exports = PullRequest;
function PullRequest (github, options) {
  this.github  = github;
  this.options = options;
}

PullRequest.prototype.setupRepo = function (repo) {
  this.repo = repo;
};

PullRequest.prototype.create = function (message) {
  return Promise.promisify(this.github.pullRequests.create)({
    title : message.title,
    body  : message.body,
    base  : this.options.base,
    head  : this.options.branch,
    user  : this.options.user,
    repo  : this.options.repo
  })
  .bind(this)
  .then(function (data) {
    logger.info('created PR #', data.number);
    this.url    = data.url;
    this.number = data.number;
    return this;
  });
};

PullRequest.prototype.assign = function (assignee) {
  return Promise.promisify(this.github.issues.edit)({
    head     : this.options.branch,
    user     : this.options.user,
    repo     : this.options.repo,
    number   : this.number,
    assignee : assignee
  })
  .bind(this)
  .then( function () {
    logger.info('assigned PR to', assignee);
    return this;
  });
};
