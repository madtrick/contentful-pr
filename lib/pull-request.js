'use strict';

var extend      = require('extend');
var Promise     = require('bluebird');
var logger      = require('./logging').logger();

module.exports = PullRequest;
function PullRequest (github, options) {
  this.github  = github;
  this.options = options;
}

PullRequest.prototype.setupRepo = function (repo) {
  this.repo = repo;
};

PullRequest.prototype.create = function (options) {
  return Promise.promisify(this.github.pullRequests.create)(options)
  .bind(this)
  .then( function (data) {
    logger.info('created PR #', data.number);
    this.url    = data.url;
    this.number = data.number;
  });
};

PullRequest.prototype.assign = function () {
  var data;

  if (!this.options.assignee) {
    return Promise.resolve(this);
  }

  data = extend(this._buildDefaultOptions(), {
    number   : this.number,
    assignee : this.options.assignee
  });

  return Promise.promisify(this.github.issues.edit)(data)
  .bind(this)
  .then( function () {
    logger.info('assigned PR to', data.assignee);
    return this;
  });
};

PullRequest.prototype._buildDefaultOptions = function () {
  return {
    user: this.repo.config.ownerName,
    repo: this.repo.config.name,
    head: this.repo.config.currentBranchName
  };
};
