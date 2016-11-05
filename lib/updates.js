const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const utils = require('./utils');

const _dashes_ = '------------------------------------------------';


class Updates {

	/**
	 *
	 * @param {Object} options
	 * @param {String} [options.path] path to contain updates scripts. Defaults to `./updates`
	 * @param {Boolean} options.exitOnFailure exit current process if failure. Defaults to `true`
	 * @param {Boolean} options.silent do not show message for executing. Default to `faslse`
	 * @param {Object} options.context the context object for passing to update script. Defaults to `{}`
	 * @param {Function} options.isUpdated `function(file: string, [callback]) => [Promise]` the function to check
	 *    the update found whether has been applied.
	 * @param {Function} options.afterUpdate `function(context: object, update: function, [callback]) => [Promise]`
	 *    the callback for one update script has been applied.
	 */
	constructor(options) {
		this.updatesPath = options.path || path.join(process.cwd(), 'updates');
		this.exitOnFailure = options.exitOnFailure !== false;
		this.silent = options.silent === true;
		this.context = options.context || {};
		this.isUpdated = options.isUpdated || (file => true); // default return true for all has been updated to avoid miss
		this.afterUpdate = options.afterUpdate || ((context, update) => ({}));
	}

	apply(callback) {
		const result = {context: this.context, updates: 0, skips: 0};

		const files = utils.findVersionedFiles(this.updatesPath);

		const promise = Promise.mapSeries(files, file => this._execute(file, result))
			.then(() => {
				if (!this.silent && (result.updates || result.skips)) {
					let status = '';
					if (result.updates) {
						status += 'Successfully applied ' + utils.plural(result.updates, '* update');
						if (result.skips) {
							status += ', ';
						}
					}
					if (result.skips) {
						status += 'Skipped ' + utils.plural(result.skips, '* update');
					}
					status += '.';
					console.log(_dashes_ + '\n' + status + '\n' + _dashes_);
				}
			})
			.catch(err => {
				let msg = 'An error occurred executing updates. \n\nError details:';
				if (!(result.updates || result.skips)) {
					msg = _dashes_ + '\n' + msg;
				}
				utils.logError(msg);
				utils.logError(err);

				if (this.exitOnFailure) {
					// wait till nextTick to exit so the trace completes.
					return process.nextTick(function () {
						process.exit(1);
					});
				}
				throw err;
			})
			// expose ctx for short spelling
			.thenReturn(result);

		return callback ? promise.asCallback(callback) : promise;
	}

	_execute(file, result) {
		// execute one update file
		return utils.invoke(this.isUpdated, file).then(updated => {
			if (updated) return;

			const update = require(path.join(this.updatesPath, file));
			if (!update) {
				return ++result.skips;
			}

			// ensure type
			if (typeof update !== 'function') {
				throw new Error('\nError in update file ./updates/' + file + '.js\nCause: Update files must export a function\n');
			}

			// expose path and file without extension name
			update.__path = this.updatesPath;
			update.__file = file;

			!this.silent && console.log(_dashes_ + '\nExecuting update ' + file + ' ...');

			return utils.invoke(update, this.context)
				.then(() => utils.invoke(this.afterUpdate, this.context, update))
				.then(() => ++result.updates);
		});
	}
}

module.exports = options => new Updates(options);
module.exports.Updates = Updates;
