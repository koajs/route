/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var debug = require('debug')('koa-route');
var methods = require('methods');

module.exports = prefix();

function prefix(path) {
  path = path || '';

  function prefixed(nestedPath) {
    return prefix(path + nestedPath);
  }

  methods.forEach(function(method){
    prefixed[method] = create(path, method);
  });

  prefixed.del = prefixed.delete;
  prefixed.all = create(path);

  return prefixed;
}

function create(prefix, method) {
  if (method) method = method.toUpperCase();

  return function(path, fn, opts){
    if(typeof path === 'function') {
      opts = fn;
      fn = path;
      path = '';
    }

    var fullPath = prefix + path;
    var re = pathToRegexp(fullPath, opts);
    debug('%s %s -> %s', method || 'ALL', fullPath, re);

    return function *(next){
      var m;

      // method
      if (!matches(this, method)) return yield* next;

      // path
      if (m = re.exec(this.path)) {
        var args = m.slice(1).map(decode);
        debug('%s %s matches %s %j', this.method, fullPath, this.path, args);
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
