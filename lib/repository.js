'use strict';

var Promise     = require('bluebird');
var logger      = require('./logging').logger();

module.exports = Repository;
function Repository (gitty) {
  var repoPath = process.cwd();
  this.gitty   = gitty(repoPath);

  this.config = {};
  this.config.remote = 'origin';
}

Repository.prototype.setup = function () {
  var promise = Promise.all([
    this.getCurrentBranchName(),
    this.getRemoteOwnerName(),
    this.getRemoteRepoName()
  ])
  .bind(this)
  .then(function (args) {
    this.config.currentBranchName = args[0];
    this.config.ownerName         = args[1];
    this.config.name              = args[2];

    return this;
  });

  return promise;
};

Repository.prototype.getCurrentBranchName = function () {
  return this._getBranches()
  .then( function (branches) {
    return branches.current;
  });
};

Repository.prototype.push = function () {
  var currentBranchName   = this.config.currentBranchName;
  var remote              = this.config.remote;

  if ( currentBranchName === 'master') {
    logger.error('Not pushing master');
    return;
  }

  return Promise.promisify(this.gitty.push)(remote, currentBranchName, {})
  .bind(this)
  .then(function () {
    logger.info('Pushed branch', currentBranchName);
    return this;
  });
};

Repository.prototype.getRemoteOwnerName = function () {
  return this._getRemotes()
  .then( function (remotes) {
    return remotes.origin.match(/\:([\w-]+)\/.+$/)[1];
  });
};

Repository.prototype.getRemoteRepoName = function () {
  return this._getRemotes()
  .then( function (remotes) {
    return remotes.origin.match(/\/([\w-]+)\.git$/)[1];
  });
};

Repository.prototype._getBranches = function () {
  return Promise.promisify(this.gitty.getBranches, this.gitty)();
};

Repository.prototype._getRemotes = function () {
  return Promise.promisify(this.gitty.getRemotes, this.gitty)();
};
