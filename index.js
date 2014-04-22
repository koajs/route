
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

  return function(path){
    var re = pathToRegexp(path);
    debug('%s %s -> %s', method, path, re);

    var fns = Array.prototype.slice.call(arguments, 1);
    var fn = fns.pop();

    function transform (ctx, args) {
      return function (fn) { return fn.apply(ctx, args); };
    }

    return function *(next){
      var m;

      // method
      if (method && method != this.method) return yield next;

      // path
      if (m = re.exec(this.path)) {
        var args = m.slice(1).map(decodeURIComponent);
        debug('%s %s matches %s %j', this.method, path, this.path, args);
        yield fns.map(transform(this, args));
        args.push(next);
        yield fn.apply(this, args);
        return;
      }

      // miss
      yield next;
    }
  }
}
