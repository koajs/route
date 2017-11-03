# koa-route

 Uber simple route middleware for koa.

```js
const { get } = require(`koa-route`);
app
  .use(get(`/pets`, pets.list))
  .use(get(`/pets/:name`, pets.show));
```

 If you need a full-featured solution check out [koa-router](https://github.com/alexmingoia/koa-router),
 a Koa clone of express-resource.

## Installation

```bash
$ npm install koa-route # or "yarn add koa-route"
```

## Example

  Contrived resource-oriented example:

```js
const { get } = require(`koa-route`);
const app = new (require(`koa`))();

const db = {
  tobi: { name: `tobi`, species: `ferret` },
  loki: { name: `loki`, species: `ferret` },
  jane: { name: `jane`, species: `ferret` },
};

const pets = {
  list: ctx => {
    const names = Object.keys(db);
    ctx.body = `pets: ${names.join(`, `)}`;
  },

  show: (ctx, name) => {
    const pet = db[name];
    if (!pet) return ctx.throw(`cannot find that pet`, 404);
    ctx.body = `${pet.name} is a ${pet.species}`;
  },
};

app
  .use(get(`/pets`, pets.list))
  .use(get(`/pets/:name`, pets.show))
  .listen(3000);
console.log(`listening on port 3000`);
```

## License

  MIT
