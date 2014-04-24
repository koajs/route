# koa-route

Uber simple route middleware for Koa.

```js
var route = require('koa-route');
app.use(route.get('/pets', pets.list));
app.use(route.get('/pets/:name', pets.show));
```

If you need a full-featured solution check out
[koa-router](https://github.com/alexmingoia/koa-router), a Koa clone of
express-resource.

## Installation

```
$ npm install koa-route
```

## Test

```
$ make test
```

## Example

Contrived resource-oriented example.

```js
var route = require('koa-route');
var koa = require('koa');
var app = koa();

var db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

var pets = {
  list: function *(){
    var names = Object.keys(db);
    this.body = 'pets: ' + names.join(', ');
  },

  show: function *(name){
    var pet = db[name];
    if (!pet) return this.error('cannot find that pet', 404);
    this.body = pet.name + ' is a ' + pet.species;
  }
};

app.use(route.get('/pets', pets.list));
app.use(route.get('/pets/:name', pets.show));

app.listen(3000);
console.log('listening on port 3000');
```

## License

MIT
