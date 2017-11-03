# koa-route

 Uber simple route middleware for koa.

```js
const _ = require('koa-route');
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
const _ = require('koa-route');
const Koa = require('koa');
const app = new Koa();

const db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

const pets = {
  list: (ctx) => {
    const names = Object.keys(db);
    ctx.body = 'pets: ' + names.join(', ');
  },

  show: (ctx, name) => {
    const pet = db[name];
    if (!pet) return ctx.throw('cannot find that pet', 404);
    ctx.body = pet.name + ' is a ' + pet.species;
  }
};

app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show));

app.listen(3000, console.log.bind(this, 'listening on port 3000'));
```

## License

  MIT
