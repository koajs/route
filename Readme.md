# koa-route

 Uber simple route middleware for koa.

```js
var _ = require('koa-route');
app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show));
```

 If you need a full-featured solution check out [koa-router](https://github.com/alexmingoia/koa-router),
 a Koa clone of express-resource.

## Installation

```js
$ npm install koa-route
```

## Example

  Contrived resource-oriented example:

```js
var _ = require('koa-route');
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
    if (!pet) return this.throw('cannot find that pet', 404);
    this.body = pet.name + ' is a ' + pet.species;
  }
};

/* Create a nested prefix */
var api = _('/api');
var pets = api('/pets')

/* Now we listen to the routes /api/pets and /api/pets/:name */
app.use(pets.get(pets.list));
app.use(pets.get('/:name', pets.show));

app.listen(3000);
console.log('listening on port 3000');
```

## License

  MIT
