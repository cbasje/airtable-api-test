import express, { Request, Response, Application } from 'express';
import { Server } from 'http';
import airtable, { FieldSet, Record } from 'airtable';
import { Velden } from './model';

import dotenv from 'dotenv';
dotenv.config();

import datastore from 'nedb';
const db = new datastore({
	filename: '.data/datafile',
	autoload: true,
	timestampData: true,
});

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Airtable integration
app.get('/items', async (req: Request, res: Response) => {
	var data = [];

	const updateTime = await getUpdateTimestamp();
	console.log(
		`Found ${updateTime}; difference ${new Date().getTime() - updateTime}`
	);
	var timeDiff =
		updateTime != undefined
			? new Date().getTime() - updateTime
			: 9999999999;

	if (timeDiff > 60 * 60 * 1000) data = await getFromAirtable();
	else data = await getFromDatabase();

	res.json({ message: 'Successfully loaded', data: data });
});

app.post('/reset', (req: Request, res: Response) => {
	resetDatabase();
	res.status(200).end();
	console.log('reset');
});

const listener: Server = app.listen(process.env.PORT || 3000, () => {
	const address = listener.address();
	const isPort =
		typeof address != 'string' && address != null ? address.port : 3000;
	console.log('Your app is listening on port ' + isPort);
});

/* --------------------------- */

async function getUpdateTimestamp(): Promise<number> {
	var responseData = await new Promise<number>((resolve, reject) => {
		db.findOne({}, (err, data) => {
			if (err) reject(err);
			else if (data == null) resolve(0);
			else {
				resolve(data.updatedAt.getTime());
			}
		});
	});

	return responseData;
}

async function getFromDatabase(): Promise<Record<Velden>[]> {
	console.log('From DB');

	var responseData = await new Promise<Record<Velden>[]>(
		(resolve, reject) => {
			db.find({}, (err: Error, data: any) => {
				if (err) reject(err);
				else {
					resolve(data);
				}
			});
		}
	);

	return responseData;
}

async function getFromAirtable(): Promise<Record<Velden>[]> {
	console.log('From Airtable');

	resetDatabase();

	var responseData: Record<Velden>[] = [];

	var base = new airtable({ apiKey: process.env.AIRTABLE_API }).base(
		'appr81RLyTfwdxIUX'
	);
	await base<Velden>('Guestbook')
		.select({
			view: 'Grid view',
		})
		.eachPage((records, fetchNextPage) => {
			records.forEach((record) => {
				// console.log('Retrieved', record.get('Name'));

				responseData.push(record._rawJson);
				saveToDatabase(record);
			});

			fetchNextPage();
		});

	return responseData;
}

function saveToDatabase(item: Record<Velden>) {
	db.insert(item._rawJson);
}
// function saveToDatabase(items: Record<Velden>[]) {
// 	items.forEach((item) => {
// 		db.insert(item['_rawJson']);
// 	});
// }

function resetDatabase() {
	db.remove({}, { multi: true }, function (err) {
		if (err) console.log("There's a problem with the database: ", err);
		else console.log('Database cleared');
	});
}
