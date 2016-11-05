"use strict";

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const inflect = require('inflect');
const Promise = require('bluebird');

const fetchVersion = s => s.split(/[\-_]+/g)[0];

// logError is used to log errors before the process exits since it is more synchronous than console.error.  Using
// console.error gets into race condition issues with process.exit, which has higher priority.
exports.logError = (...args) => _.forEach(args, arg => process.stderr.write('>> ' + arg + '\n'));

exports.findVersionedFiles = function findVersionedFiles(dir) {

	return fs.readdirSync(dir)
		// exclude non-javascript or coffee files in the updates folder
		.map(f => _.includes(['.js', '.coffee'], path.extname(f)) && path.basename(f, '.js'))
		// exclude falsy values and filenames that without a valid semver
		.filter(f => f && semver.valid(fetchVersion(f)))
		// sort by version
		.sort((a, b) => semver.compare(fetchVersion(a), fetchVersion(b)));
};

/**
 * Displays the singular or plural of a string based on a number
 * or number of items in an array.
 *
 * If arity is 1, returns the plural form of the word.
 *
 * @param {String|Number} count
 * @param {String} [singular] string
 * @param {String} [plural] string
 * @return {String} singular or plural, * is replaced with count
 * @api public
 */
exports.plural = function plural(count, singular, plural) {
	if (arguments.length === 1) {
		return inflect.pluralize(count);
	}
	if (typeof singular !== 'string') singular = '';
	if (!plural) {
		plural = inflect.pluralize(singular);
	}
	if (typeof count === 'string') {
		count = Number(count);
	} else if (typeof count !== 'number') {
		count = Object.keys(count).length;
	}
	return (count === 1 ? singular : plural).replace('*', count);
};

exports.invoke = function invoke(fn, ...args) {
	if (fn.length > args.length) {
		return Promise.fromCallback(cb => fn(...args, cb));
	}
	return Promise.resolve(fn(...args));
};
