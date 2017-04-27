var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var bodyParser = require('body-parser');
var PetShelter = require('./models/pet_shelter');

var app = express();

var connection = connect();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



app.get('/api/v1/pets/index', function(request, response) {
  PetShelter.find({}, function(err, pets) {
    if ( err ) {
      return response.status(404).json({ error: err });
    }
    response.json({ pets: pets });
  });
});

app.get('/api/v1/pets/:id', function(request, response) {
  PetShelter.findOne({_id: request.params.id}, function(err, pet) {
    if ( err ) {
      return response.status(404).json({ error: {message: 'Not Found'} });
    }
    response.json({ pet: pet });
  });
});

app.post('/api/v1/pets', function(request, response) {

  var pet = new PetShelter({
    name: request.body.name,
    breed: request.body.breed,
    type: request.body.type,
    location: {
      coordinates: request.body.location.coordinates
    }
  });

  pet.save(function(err, pet) {
    if ( err ) {
      return response.status(400).json({ error: err });
    }
    response.json({ pet: pet });
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  return res.status(500).json({ error: 'Server Error' });
})


connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });
}

function connect () {
  var connection = mongoose.connect(config.db).connection;
  return connection;
}


