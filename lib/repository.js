'use strict';

var gitty       = require('gitty');
var Promise     = require('bluebird');
var logger      = require('./logging').logger();

module.exports = Repository;
function Repository () {
  this.config = {};
  this.config.remote = 'origin';
}

Repository.prototype.setup = function () {
  var promise = Promise.all([
    getCurrentBranchName(),
    getRepoOwner(),
    getRepoName()
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

Repository.prototype.push = function () {
  var repo                = repository();
  var currentBranchName   = this.config.currentBranchName;
  var remote              = this.config.remote;

  if ( currentBranchName === 'master') {
    logger.error('Not pushing master');
    return;
  }

  return Promise.promisify(repo.push)(remote, currentBranchName, {})
  .bind(this)
  .then(function () {
    logger.info('Pushed branch', currentBranchName);
    return this;
  });
};

function repository () {
  var repoPath = process.cwd();
  var repo = gitty(repoPath);

  return repo;
}

function getRemote () {
  var repo = repository();

  return Promise.promisify(repo.getRemotes, repo)();
}

function getBranches () {
  var repo = repository();

  return Promise.promisify(repo.getBranches, repo)();
}

function getCurrentBranchName () {
  return getBranches()
  .then(function (branches) {
    return branches.current;
  });
}

function getRepoName () {
  return getRemote()
  .then(getRepoNameFromRemote);
}

function getRepoOwner () {
  return getRemote()
  .then(getRepoOwnerFromRemote);
}

function getRepoNameFromRemote (remote) {
  var remoteName = remote.origin.match(/\/([\w-]+)\.git$/)[1];
  return remoteName;
}

function getRepoOwnerFromRemote (remote) {
  var repoOwner = remote.origin.match(/\:([\w-]+)\/.+$/)[1];
  return repoOwner;
}
