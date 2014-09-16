
var request = require('supertest');
var koa = require('koa');

var methods = require('methods').map(function(method){
  // normalize method names for tests
  if (method == 'delete') method = 'del';
  if (method == 'connect') return; // WTF
  return method;
}).filter(Boolean)

var route = require('..');

methods.forEach(function(method){
  var app = koa();
  app.use(route[method]('/:user(tj)', function*(user){
    this.body = user;
  }))

  describe('route.' + method + '()', function(){
    describe('when method and path match', function(){
      it('should 200', function(done){
        request(app.listen())
        [method]('/tj')
        .expect(200)
        .expect(method === 'head' ? '' : 'tj', done);
      })
    })

    describe('when only method matches', function(){
      it('should 404', function(done){
        request(app.listen())
        [method]('/tjayyyy')
        .expect(404, done);
      })
    })

    describe('when only path matches', function(){
      it('should 404', function(done){
        request(app.listen())
        [method === 'get' ? 'post' : 'get']('/tj')
        .expect(404, done);
      })
    })
  })
})

describe('route.all()', function(){
  describe('should work with', function(){
    methods.forEach(function(method){
      var app = koa();
      app.use(route.all('/:user(tj)', function*(user){
        this.body = user;
      }))

      it(method, function(done){
        request(app.listen())
        [method]('/tj')
        .expect(200)
        .expect(method === 'head' ? '' : 'tj', done);
      })
    })
  })

  describe('when patch does not match', function(){
    it('should 404', function (done){
      var app = koa();
      app.use(route.all('/:user(tj)', function*(user){
        this.body = user;
      }))

      request(app.listen())
      .get('/tjayyyyyy')
      .expect(404, done);
    })
  })
})

describe('route params', function(){
  methods.forEach(function(method){
    var app = koa();

    app.use(route[method]('/:user(tj)', function*(user, next){
      yield next;
    }))

    app.use(route[method]('/:user(tj)', function*(user, next){
      this.body = user;
      yield next;
    }))

    app.use(route[method]('/:user(tj)', function*(user, next){
      this.status = 201;
    }))

    it('should work with method ' + method, function(done){
      request(app.listen())
        [method]('/tj')
        .expect(201)
        .expect(method === 'head' ? '' : 'tj', done);
    })
  })

  it('should work with method head when get is defined', function(done){
    var app = koa();

    app.use(route.get('/tj', function *(name){
      this.body = 'foo';
    }));

    request(app.listen())
    ['head']('/tj')
    .expect(200, done)
  })

  it('should be decoded', function(done){
    var app = koa();

    app.use(route.get('/package/:name', function *(name){
      name.should.equal('http://github.com/component/tip');
      done();
    }));

    request(app.listen())
    .get('/package/' + encodeURIComponent('http://github.com/component/tip'))
    .end(function(){});
  })

  it('should be null if not matched', function(done){
    var app = koa();

    app.use(route.get('/api/:resource/:id?', function *(resource, id){
      resource.should.equal('users');
      (id == null).should.be.true;
      done();
    }));

    request(app.listen())
    .get('/api/users')
    .end(function(){});
  })
})
