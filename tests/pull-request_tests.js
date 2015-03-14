'use strict';

require('./helpers');

var extend = require('extend');
var logger      = require('../lib/logging').logger({verbose: false});
var PullRequest = require('../lib/pull-request');

describe('PullRequest', function () {
  beforeEach(function () {
    this.github = {
      pullRequests: {
        create: sinon.stub().callsArgWith(1, null, {url: 'pr-url', number: 1})
      },
      issues: {
        edit: sinon.stub().callsArgWith(1, null)
      }
    };

    sinon.spy(logger, 'info');

    this.pullRequest = new PullRequest(this.github, {});
  });

  describe('#create', function () {
    beforeEach(function () {
      this.options = {
        user: 'me',
        repo: 'the-repo',
        base: 'master',
        head: 'feature/another-branch'
      };

      this.message = {title: 'PR title', body: 'PR body'};

      this.pullRequest = new PullRequest(this.github, this.options);
      this.pullRequest.create(this.message);
    });

    it('creates a pull request', function () {
      expect(this.github.pullRequests.create.calledOnce).to.be(true);
    });

    it('creates a pull request with the expected arguments', function () {
      var data = this.github.pullRequests.create.getCall(0).args[0];

      expect(data).to.eql(extend(this.message, this.options));
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

        it('logs the pull request number', function () {
          var args = logger.info.getCall(0).args;

          expect(args[0]).to.equal('created PR #');
          expect(args[1]).to.equal(1);
        });
      });
    });
  });

  describe('#assign', function () {
    beforeEach(function () {
      this.options = {
        user: 'me',
        repo: 'the-repo',
        branch: 'feature/another-branch',
        base: 'master',
        assignee: 'he'
      };

      this.pullRequest        = new PullRequest(this.github, this.options);
      this.pullRequest.number = 1;
      this.pullRequest.assign();
    });

    it('edits the pull request', function () {
      expect(this.github.issues.edit.calledOnce).to.be(true);
    });

    it('edits the pull request and assigns it', function () {
      var data = this.github.issues.edit.getCall(0).args[0];

      expect(data).to.eql({
        user     : this.options.user,
        head     : this.options.branch,
        repo     : this.options.repo,
        number   : this.pullRequest.number,
        assignee : this.options.assignee
      });
    });

    describe('on successful assignation', function () {
      it('logs to stdout', function () {
        expect(logger.info.calledOnce).to.be(true);
      });

      it('logs the assignee name', function () {
        var args = logger.info.getCall(0).args;

        expect(args[0]).to.equal('assigned PR to');
        expect(args[1]).to.equal('he');
      });
    });
  });
});
