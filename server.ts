// server.js
// where your node app starts

require('dotenv').config();

const express = require('express');
const airtable = require('airtable');

// setup a new database
// const Datastore = require('nedb');
// // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
// // which doesn't get copied if someone remixes the project.
// var db = new Datastore({
// 	filename: '.data/datafile',
// 	autoload: true,
// 	timestampData: true,
// });
const datastore = require('nedb-promise');
var db = datastore({
	filename: '.data/datafile',
	autoload: true,
	timestampData: true,
});

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Airtable integration
app.get('/items', async (request, response) => {
	var data = [];

	const updateTime = await getUpdateTimestamp();
	var timeDiff =
		updateTime != undefined
			? new Date().getTime() - updateTime
			: 9999999999;

	// console.log(
	// 	updateTime,
	// 	new Date().getTime(),
	// 	new Date().getTime() - updateTime
	// );

	if (timeDiff > 60 * 60 * 1000) data = await getFromAirtable();
	else data = getFromDatabase();

	response.json({ message: 'Hello', data: data });
});

app.post('/reset', (req, res) => {
	resetDatabase();
	res.status(200).end();
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});

/* --------------------------- */

async function getUpdateTimestamp() {
	var response = 0;

	await db.findOne({}, (err, data) => {
		console.log(
			data != null ? new Date(data.updatedAt).getTime() : 'Nothing'
		);

		if (data == null) response = 0;
		else response = data.updatedAt;
	});

	return response;
}

// function setUpdateTimestamp(timestamp) {
// 	// console.log(timestamp);

// 	db.insert({ timestamp: timestamp });
// }

function getFromDatabase() {
	console.log('From DB');

	var response = [];

	db.find({}, (err, data) => {
		if (err) {
			return;
		}
		response = data;
	});

	return response;
}

async function getFromAirtable() {
	console.log('From Airtable');

	var response = [];

	var base = new airtable({ apiKey: process.env.AIRTABLE_API }).base(
		'appr81RLyTfwdxIUX'
	);

	await base('Guestbook')
		.select({
			view: 'Grid view',
		})
		.eachPage(function page(records, fetchNextPage) {
			// This function (`page`) will get called for each page of records.

			records.forEach(function (record) {
				// console.log('Retrieved', record.get('Name'));
			});
			response = records;
			saveToDatabase(records);

			// To fetch the next page of records, call `fetchNextPage`.
			// If there are more records, `page` will get called again.
			// If there are no more records, `done` will get called.
			fetchNextPage();
		});
	return response;
}

function saveToDatabase(items) {
	console.log('Save to DB');

	items.forEach((item) => {
		db.insert(item);
		console.log(`Save ${item.get('Name')}`);
	});

	// setUpdateTimestamp(new Date().getTime());
}

function resetDatabase() {
	db.remove({}, { multi: true }, function (err) {
		if (err) console.log("There's a problem with the database: ", err);
		else console.log('Database cleared');
	});
}
