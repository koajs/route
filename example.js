
var r = require('./');
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
var api = r('/api');
var pets = api('/pets')

/* Now we listen to the routes /api/pets and /api/pets/:name */
app.use(pets.get(pets.list));
app.use(pets.get('/:name', pets.show));

app.listen(3000);
console.log('listening on port 3000');