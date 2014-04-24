/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var methods = require('methods');
var assert = require('assert');
var debug = require('debug')('koa-route');

/**
 * Method handlers.
 *
 * These are all added to the public api.
 */

methods.forEach(function (method) {
  exports[method] = create(method);
});

exports.del = exports.delete;

// for when you just don't care about the method
exports.all = create();

/**
 * @param {String} method
 * @return {GeneratorFunction}
 * @api private
 */

function create (method) {
  // uppercase... because just in-case
  if (method) method = method.toUpperCase();

  return function (path) {
    // we allow for multiple handlers on a route
    var fns = Array.prototype.slice.call(arguments, 1);
    // but we need atleast one
    var fn = fns.pop();
    assert(fn, 'route must have atleast one handler');

    // we want to extract the params from the path
    var params = [];
    var re = pathToRegexp(path, params);
    debug('%s %s -> %s', method, path, re);

    // paramify the params, transforming them to their corresponding paramifying
    // functions
    params = paramify(params);

    return function* (next){
      // if the method of the route isn't set or doesn't equal the method of the
      // request, we simply skip
      if (method && method != this.method) return yield next;

      var match = re.exec(this.path);
      // if the path of the request doesn't match the route, we skip
      if (!match) return yield next;
      // we have a winner, the path matched one of our routes

      // decode uri components on all path arguments
      var args = match.slice(1).map(decodeURIComponent);
      debug('%s %s matches %s %j', this.method, path, this.path, args);

      // save the ctx applificiation so that we can apply the same arguments and
      // ctx to both the paramifiers and the preceding handlers
      var ctx = apply(this, args);

      // run the paramifiers, notice, they do not receive the next generator
      yield params.map(ctx);

      // run the preceding handlers, they do not receive the next generator
      // either
      yield fns.map(ctx);

      // pass along the next generator
      args.push(next);
      yield fn.apply(this, args);
    }
  }
}

/**
 * @param {Object} ctx
 * @param {Array} args
 */

function apply (ctx, args) {
  return function (fn) {
    return fn.apply(ctx, args);
  };
}

/**
 * Paramification.
 */

var paramifiers = {};

/**
 * @param {String}
 * @param {GeneratorFunction}
 * @api public
 */

exports.param = function (param, fn) {
  (paramifiers[param] = paramifiers[param] || []).push(fn);
}

/**
 * @param {Array} params
 * @api private
 */

function paramify (params) {
  // filter out the params that we dont have paramifiers for and then return
  // those we do have
  var params = params.filter(function (key) { return !!paramifiers[key.name] })
    .map(function (key) { return paramifiers[key.name] });
  // flatten the functions so we can yield them nicely
  return Array.prototype.concat.apply([], params);
}
