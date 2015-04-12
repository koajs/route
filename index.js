/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var debug = require('debug')('koa-route');
var methods = require('methods');

methods.forEach(function(method){
  exports[method] = create(method);
});

exports.del = exports.delete;
exports.all = create();

function create(method) {
  if (method) method = method.toUpperCase();

  return function(path, fn, opts){
    var re = pathToRegexp(path, opts);
    debug('%s %s -> %s', method || 'ALL', path, re);

    return function *(next){
      var m;

      // method
      if (!matches(this, method)) return yield* next;

      // path
      if (m = re.exec(this.path)) {
        var args = m.slice(1).map(decode);
        debug('%s %s matches %s %j', this.method, path, this.path, args);
        args.push(next);
        yield* fn.apply(this, args);
        return;
      }

      // miss
      return yield* next;
    }
  }
}

/**
 * Decode value.
 */

function decode(val) {
  if (val) return decodeURIComponent(val);
}

/**
 * Check request method.
 */

function matches(ctx, method) {
  if (!method) return true;
  if (ctx.method === method) return true;
  if (method === 'GET' && ctx.method === 'HEAD') return true;
  return false;
}
