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
        cb(null, {origin: 'git@github.com:madtrick/spr.git'});
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
      expect(repoName).to.equal('spr');
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

    it('pushes the current branch to the remote', function (done) {
      this.repository.push()
      .then( function () {
        var args   = this.gitty.push.args[0];
        var remote = args[0];
        var branch = args[1];

        expect(remote).to.equal('origin');
        expect(branch).to.equal('feature-branch');
        done();
      });
    });

    describe('when push succeeds', function () {
      it('logs to stdout', function () {
        this.repository.push()
        .then( function () {
          expect(logger.info.calledOnce).to.be(true);
        });
      });

      it('logs the name of the pushed branch', function () {
        this.repository.push()
        .then( function () {
          var args = logger.info.getCall(0).args;

          expect(args[0]).to.equal('Pushed branch');
          expect(args[1]).to.equal('feature-branch');
        });
      });
    });
  });
});
