// server.js
// where your node app starts
const { getItems } = require('./src/airtable-service');

var express = require('express');
// setup a new database
var Datastore = require('nedb'), 
    // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
    db = new Datastore({ filename: '.data/datafile', autoload: true });

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Excuses data
app.get("/excuses", (request, response) => {
  db.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

// Adding new excuses
app.post("/excuses-new", (request, response) => {
  db.insert({ text: request.body.excuus }); 

  // Return the request body to confirm save client side
  response.json(request.body);
});

// removes entries from users and populates it with default users
app.get("/reset", function (request, response) {
  // removes all entries from the collection
  db.remove({}, { multi: true }, function (err) {
    if(err) console.log("There's a problem with the database: ", err);
    else console.log("Database cleared");
  });
  // default excuses inserted in the database
  db.insert(excuses, function (err, excusesAdded) {
    if(err) console.log("There's a problem with the database: ", err);
    else if(excusesAdded) console.log("Default excuses inserted in the database");
  });
//   response.redirect("/");
});

app.get("/remove", function (request, response) {
  // removes all entries from the collection
  db.remove({ excuus: 'Dit is een voorbeeldexcuus' }, { multi: true }, function (err) {
    if(err) console.log("There's a problem with the database: ", err);
    else console.log("Removed from database");
  });
})

// Airtable integration
app.get("/airtable", (request, response) => {
  var data = getItems();
  response.json(data);
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});