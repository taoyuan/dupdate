"use strict";

module.exports = function (context, callback) {
	context.updates = context.updates || [];
	context.updates.push('0.3.0-updates');
	setTimeout(callback, 100);
};
