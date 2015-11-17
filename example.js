
'use strict';

var r = require('./');
var Koa = require('koa');
var app = new Koa();

var db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

var pets = {
  list: (ctx) => {
    var names = Object.keys(db);
    ctx.body = 'pets: ' + names.join(', ');
  },

  show: (ctx, name) => {
    var pet = db[name];
    if (!pet) return ctx.throw('cannot find that pet', 404);
    ctx.body = pet.name + ' is a ' + pet.species;
  }
};

app.use(r.get('/pets', pets.list));
app.use(r.get('/pets/:name', pets.show));

app.listen(3000);
console.log('listening on port 3000');
