"use strict";

const path = require('path');
const updates = require('..');

const history = ['0.0.1-updates'];
const updated = [];

updates({
	path: path.join(__dirname, 'updates'),
	isUpdated: file => history.includes(file),
	afterUpdate: (context, update) => updated.push(update.__file)
}).apply().then(result => {
	console.log('updates:', result.updates);
	console.log('skips:', result.skips);
	console.log('updated:', updated);
	// =>
	// updates: 3
	// skips: 1
	// updated: [ '0.0.2-updates', '0.3.0-updates', '1.0.0-updates' ]
});


