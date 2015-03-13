'use strict';

/* jshint ignore:start */
var sinon     = require('sinon');
global.expect = require('expect.js');
/* jshint ignore:end */

beforeEach(function () {
  global.sinon = sinon.sandbox.create();
});

afterEach(function () {
  global.sinon.restore();
});
