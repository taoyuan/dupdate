const test = require('ava');
const path = require('path');
const updates = require('..');

test('should execute all updates', t => {
	const expectedUpdated = ['0.0.1-updates', '0.0.2-updates', '0.0.3-updates'];

	const checks = [];
	const updated = [];
	return updates({
		path: path.join(__dirname, 'fixtures', 'updates'),
		isUpdated: file => checks.push(file) && false,
		afterUpdate: (context, update) => updated.push(update.__file)
	}).apply().then(result => {
		t.is(result.updates, 3);
		t.is(result.skips, 0);

		t.deepEqual(checks, expectedUpdated);
		t.deepEqual(updated, expectedUpdated);
		t.deepEqual(result.context.updates, expectedUpdated);
	});
});

test('should skip updated updates', t => {
	const expectedChecks = ['0.0.1-updates', '0.0.2-updates', '0.0.3-updates'];
	const expectedUpdated = ['0.0.1-updates', '0.0.3-updates'];

	const context = {};
	const checks = [];
	const updated = [];
	return updates({context,
		path: path.join(__dirname, 'fixtures', 'updates'),
		isUpdated: file => checks.push(file) && (file === '0.0.2-updates'),
		afterUpdate: (context, update) => updated.push(update.__file)
	}).apply().then(result => {
		t.is(result.context, context);
		t.is(result.updates, 2);
		t.is(result.skips, 0);

		t.deepEqual(checks, expectedChecks);
		t.deepEqual(updated, expectedUpdated);
		t.deepEqual(context.updates, expectedUpdated);
	});
});
