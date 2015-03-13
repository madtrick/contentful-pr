'use strict';

var Tracer = require('tracer');

function Logger (options) {
  this.options = options;
  this.tracer = this._setupTracer(options.verbose);
}

Logger.prototype.info = function () {
  this.tracer.info.apply(this.tracer, arguments);
};

Logger.prototype.error = function (message) {
  this.tracer.error(message);
};

Logger.prototype._setupTracer = function (verbose) {
  var options       = {};

  options.format = '{{message}}';
  options.level  = 'error';

  if (verbose) {
    options.level = 'info';
  }

  return Tracer.colorConsole(options);
};

function initTheLogger (options) {
  return new Logger(options);
}

var logger;
exports.logger = function (options) {
  if (!logger) {
    logger = initTheLogger(options);
  }

  return logger;
};
