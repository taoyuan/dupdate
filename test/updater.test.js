const assert = require('chai').assert;
const path = require('path');
const sinon = require('sinon');
const dupdate = require('..');
const utils = require('../lib/utils');

describe('updater', () => {
	it('should execute all updates', () => {
		const expectedUpdated = ['0.0.1-updates', '0.0.2-updates', '0.0.3-updates'];

		const checks = [];
		const updated = [];
		return dupdate({
			path: path.join(__dirname, 'fixtures', 'updates'),
			isUpdated: file => checks.push(file) && false,
			afterUpdate: (context, update) => updated.push(update.__file)
		}).apply().then(result => {
			assert.equal(result.updates, 3);
			assert.equal(result.skips, 0);

			assert.deepEqual(checks, expectedUpdated);
			assert.deepEqual(updated, expectedUpdated);
			assert.deepEqual(result.context.updates, expectedUpdated);
		});
	});

	it('should skip updated updates', () => {
		const expectedChecks = ['0.0.1-updates', '0.0.2-updates', '0.0.3-updates'];
		const expectedUpdated = ['0.0.1-updates', '0.0.3-updates'];

		const context = {};
		const checks = [];
		const updated = [];
		return dupdate({context,
			path: path.join(__dirname, 'fixtures', 'updates'),
			isUpdated: file => checks.push(file) && (file === '0.0.2-updates'),
			afterUpdate: (context, update) => updated.push(update.__file)
		}).apply().then(result => {
			assert.equal(result.context, context);
			assert.equal(result.updates, 2);
			assert.equal(result.skips, 0);

			assert.deepEqual(checks, expectedChecks);
			assert.deepEqual(updated, expectedUpdated);
			assert.deepEqual(context.updates, expectedUpdated);
		});
	});

	it('should log detail error information when error occurs', () => {
		sinon.stub(utils, "logError");
		const spy = utils.logError;

		const checks = [];
		const updated = [];
		return dupdate({
			exitOnFailure: false,
			path: path.join(__dirname, 'fixtures', 'updates-with-errors'),
			isUpdated: file => checks.push(file) && false,
			afterUpdate: (context, update) => updated.push(update.__file)
		}).apply().catch(error => {
			assert.ok(spy.calledTwice);
			assert.equal(spy.firstCall.args[0], 'An error occurred executing updates. \n\nError details:');
			assert.match(spy.lastCall.args[0], /^Error: Something is wrong\n    at module\.exports/);
		}).finally(() => {
			spy.restore();
		})
	});
});
