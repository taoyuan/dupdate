"use strict";

const assert = require('chai').assert;
const path = require('path');
const utils = require('../lib/utils');

describe('utils', () => {
	it('should find versioned files', () => {
		const files = utils.findVersionedFiles(path.join(__dirname, 'fixtures', 'updates'));
		assert.ok(files.length);
	});
});
