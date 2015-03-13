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

Repository.prototype.getCurrentBranchName = function () {
  return this._getBranches()
  .then( function (branches) {
    return branches.current;
  });
};

Repository.prototype.push = function () {
  return this.getCurrentBranchName()
  .bind(this)
  .then(function (branch) {
    if ( branch === 'master') {
      logger.error('Not pushing master');
      return;
    }

    return Promise.promisify(this.gitty.push)(this.config.remote, branch, {})
    .bind(this)
    .then(function () {
      logger.info('Pushed branch', branch);
      return this;
    });
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
