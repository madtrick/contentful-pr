'use strict';

require('./helpers');

var logger     = require('../lib/logging').logger({enabled: false});
var Repository = require('../lib/repository');

describe('Repository', function () {
  beforeEach( function () {
    var gittyStub = {
      getBranches: function (cb) {
        cb(null, {current: 'feature-branch'});
      },
      getRemotes: function (cb) {
        cb(null, {origin: 'git@github.com:madtrick/contentful-pr.git'});
      },
      push: sinon.spy(function (_remote, _branch, _params, cb) {
        cb(null);
      })
    };
    var gittyConstructorStub = sinon.stub().returns(gittyStub);

    sinon.spy(logger, 'info');

    this.gittyStub  = gittyStub;
    this.repository = new Repository(gittyConstructorStub);
  });

  it('#getCurrentBranchName', function (done) {
    this.repository.getCurrentBranchName()
    .then( function (currentBranchName) {
      expect(currentBranchName).to.equal('feature-branch');
      done();
    });
  });

  it('#getRemoteOwnerName', function (done) {
    this.repository.getRemoteOwnerName()
    .then( function (repoOwnerName) {
      expect(repoOwnerName).to.equal('madtrick');
      done();
    });
  });

  it('#getRemoteRepoName', function (done) {
    this.repository.getRemoteRepoName()
    .then( function (repoName) {
      expect(repoName).to.equal('contentful-pr');
      done();
    });
  });

  describe('#push', function () {
    it('pushes the repo', function (done) {
      this.repository.push()
      .then( function () {
        expect(this.gitty.push.calledOnce).to.be(true);
        done();
      });
    });

    describe('when logging is enabled', function () {
      describe('when push succeeds', function () {
        it('logs to stdout', function () {
          this.repository.push()
          .then( function () {
            expect(logger.info.calledOnce).to.be(true);
          });
        });
      });
    });
  });
});
