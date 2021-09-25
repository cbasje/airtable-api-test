const airtable = require('airtable');

export function getItems() {
	var response;

	var base = new airtable({ apiKey: process.env.AIRTABLE_API }).base(
		'appr81RLyTfwdxIUX'
	);

	base('Guestbook')
		.select({
			view: 'Grid view',
		})
		.eachPage(
			function page(records, fetchNextPage) {
				// This function (`page`) will get called for each page of records.

				records.forEach(function (record) {
					console.log('Retrieved', record.get('Name'));
				});
				response = records;

				// To fetch the next page of records, call `fetchNextPage`.
				// If there are more records, `page` will get called again.
				// If there are no more records, `done` will get called.
				fetchNextPage();
			},
			function done(err) {
				if (err) {
					console.error(err);
					return;
				}
			}
		);

	return response;
}
