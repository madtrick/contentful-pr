'use strict';

require('./helpers');

var logger      = require('../lib/logging').logger({enabled: false});
var PullRequest = require('../lib/pull-request');

describe('PullRequest', function () {
  beforeEach(function () {
    this.github = {
      pullRequests: {
        create: sinon.stub().callsArgWith(1, null, {url: 'pr-url', number: 1})
      }
    };

    sinon.spy(logger, 'info');

    this.pullRequest = new PullRequest(this.github, {});
  });

  describe('#create', function () {
    beforeEach(function () {
      this.options = {
        title: 'PR title',
        body: 'PR body',
        user: 'me',
        repo: 'the-repo',
        base: 'master',
        head: 'feature/another-branch'
      };

      this.pullRequest.create(this.options);
    });
    it('creates a pull request', function () {
      expect(this.github.pullRequests.create.calledOnce).to.be(true);
    });

    it('creates a pull request with the expected arguments', function () {
      var data = this.github.pullRequests.create.getCall(0).args[0];

      expect(data).to.equal(this.options);
    });

    describe('on successful creation', function () {
      it('sets the pull request number', function () {
        expect(this.pullRequest.number).to.equal(1);
      });

      it('sets the pull request url', function () {
        expect(this.pullRequest.url).to.equal('pr-url');
      });

      describe('when logging is enabled', function () {
        it('logs to stdout', function () {
          expect(logger.info.calledOnce).to.be(true);
        });
      });

    });
  });
});
