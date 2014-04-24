
var request = require('supertest');
var koa = require('koa');

var methods = require('methods').map(function (method) {
  // normalize method names for tests
  if (method == 'delete') method = 'del';
  if (method == 'connect') return; // WTF
  return method;
}).filter(Boolean)

var route = require('..');

methods.forEach(function(method) {
  var app = koa();

  app.use(route[method]('/:user(tj)', function* (user) {
    this.body = user;
  }));

  describe('route.' + method + '()', function () {
    describe('when method and path match', function () {
      it('should 200', function (done){
        request(app.listen())
          [method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
      });
    });

    describe('when only method matches', function () {
      it('should 404', function (done) {
        request(app.listen())
          [method]('/tjayyyy')
          .expect(404, done);
      });
    });

    describe('when only path matches', function () {
      it('should 404', function (done) {
        request(app.listen())
          [method === 'get' ? 'post' : 'get']('/tj')
          .expect(404, done);
      });
    });
  });
});

describe('route.all()', function () {
  describe('should work with', function () {
    methods.forEach(function (method){
      var app = koa();

      app.use(route.all('/:user(tj)', function* (user){
        this.body = user;
      }))

      it(method, function (done){
        request(app.listen())
          [method]('/tj')
          .expect(200)
          .expect(method === 'head' ? '' : 'tj', done);
      });
    });
  });

  describe('when patch does not match', function () {
    it('should 404', function (done) {
      var app = koa();
      app.use(route.all('/:user(tj)', function* (user) {
        this.body = user;
      }));

      request(app.listen())
        .get('/tjayyyyyy')
        .expect(404, done);
    });
  });
});

describe('route params', function () {
  methods.forEach(function (method) {
    var app = koa();

    app.use(route[method]('/:user(tj)', function* (user, next) {
      yield next;
    }));

    app.use(route[method]('/:user(tj)', function* (user, next) {
      this.body = user;
      yield next;
    }))

    app.use(route[method]('/:user(tj)', function* (user, next) {
      this.status = 201;
    }))

    it('should work with method ' + method, function (done){
      request(app.listen())
        [method]('/tj')
        .expect(201)
        .expect(method === 'head' ? '' : 'tj', done);
    });
  });

  it('should be decoded', function(done){
    var app = koa();

    app.use(route.get('/package/:name', function *(name){
      name.should.equal('http://github.com/component/tip');
      done();
    }));

    request(app.listen())
      .get('/package/' + encodeURIComponent('http://github.com/component/tip'))
      .end(function(){});
  });
});

describe('multiple route fns', function () {
  it('should handle more than one fn', function (done) {
    var app = koa();

    function* intermediateFn (name) {
      name.should.equal('hallas');
    }

    app.use(route.get('/users/:name', intermediateFn, function* (name) {
      name.should.equal('hallas');
      done();
    }));

    request(app.listen())
      .get('/users/hallas')
      .end(function() {});
  });

  it('should throw in intermediate', function (done) {
    var app = koa();

    function* intermediateFn (name) {
      try {
        this.throw('intermediate error');
      } catch (err) {
        err.should.be.an.Error;
      }
    }

    app.use(route.get('/users/:name', intermediateFn, function* (name) {
      name.should.equal('hallas');
      done();
    }));

    request(app.listen())
      .get('/users/hallas')
      .end(function() {});
  });

  it('should pass ctx along', function (done) {
    var app = koa();

    function* intermediateFn (firstName, lastName) {
      this.fullName = firstName + ' ' + lastName;
    }

    app.use(route.get('/users/:first/:last', intermediateFn, function* (first, last) {
      this.fullName.should.equal(first + ' ' + last);
      done();
    }));

    request(app.listen())
      .get('/users/chris/hallas')
      .end(function() {});
  });
});

describe('paramify', function () {
  var param = route.param;
  var get = route.get;

  var app = koa();

  param('user', function* (id) {
    if (id == '1') {
      this.user = { name: 'one' };
    } else {
      this.status = 404;
    }
  });

  param('user', function* (id) {
    this.pre = 'lol: ';
  });

  app.use(get('/:user', function* () {
    this.body = this.pre + this.user.name;
  }));

  it('should work without params', function (done) {
    var app = koa();

    app.use(route.get('/', function* (user) {
      this.body = 'home';
    }));

    request(app.listen())
      .get('/')
      .expect('home', done);
  });

  it('should work without param fns', function (done) {
    var app = koa();

    app.use(route.get('/:user', function* (user) {
      this.body = user;
    }));

    request(app.listen())
      .get('/julian')
      .expect('julian', done);
  });

  it('should work with param fns', function (done) {
    var app = koa();

    route.param('user', function* (id) {
      this.user = 'julian';
    });

    app.use(route.get('/:user', function* () {
      this.body = this.user;
    }));

    request(app.listen())
      .get('/julian')
      .expect('julian', done);
  });

  it('should work with multiple params', function (done) {
    var app = koa();

    route.param('user', function* (id) {
      this.user = 'julian';
    });

    route.param('repo', function* (id) {
      this.repo = 'repo';
    });

    app.use(route.get('/:user/:repo', function* () {
      this.body = this.user + ': ' + this.repo;
    }));

    request(app.listen())
      .get('/julian/repo')
      .expect('julian: repo', done);
  });

  it('should abort inside param fns', function (done) {
    var app = koa();

    route.param('user', function* (id) {
      this.status = 404;
    });

    app.use(route.get('/:user', function* () {
      this.body = this.user;
    }));

    request(app.listen())
      .get('/julian')
      .expect(404, done);
  });

  it('should accept middleware', function (done) {
    var app = koa();

    route.param('user', function* (id) {
      this.user = 'julian';
    });

    route.param('user', function* () {
      this.user = this.user.toUpperCase();
    });

    app.use(route.get('/:user', function* () {
      this.body = this.user;
    }));

    request(app.listen())
      .get('/julian')
      .expect('JULIAN', done);
  });
});
