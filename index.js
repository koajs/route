/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var methods = require('methods');
var debug = require('debug')('koa-route');


/**
 * Method handlers.
 */

methods.forEach(function (method){
  exports[method] = create(method);
});

exports.del = exports.delete;

// for when you just don't care about the method
exports.all = create();


/**
 * @param {String} method
 * @api private
 */

function create (method) {
  // uppercase... because just in-case
  if (method) method = method.toUpperCase();

  return function (path, fn) {
    var re = pathToRegexp(path);
    debug('%s %s -> %s', method, path, re);

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

      // pass along the next generator
      args.push(next);
      yield fn.apply(this, args);
    }
  }
}
