"use strict";

const test = require('ava');
const path = require('path');
const utils = require('../lib/utils');

test('should find versioned files', t => {
	const files = utils.findVersionedFiles(path.join(__dirname, 'fixtures', 'updates'));
	t.truthy(files.length);
});
