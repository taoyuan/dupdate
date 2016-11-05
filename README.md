# dupdate [![Build Status](https://travis-ci.org/taoyuan/dupdate.svg?branch=master)](https://travis-ci.org/taoyuan/dupdate) [![Coverage Status](https://coveralls.io/repos/github/taoyuan/dupdate/badge.svg?branch=master)](https://coveralls.io/github/taoyuan/dupdate?branch=master)

> Apply database updates to application based on semver file names.


## Install

```
$ npm install --save dupdate
```

## Usage

```js
"use strict";

const path = require('path');
const dupdate = require('..');

const history = ['0.0.1-updates'];
const updated = [];


const updater = new dupdate.Updater({
	path: path.join(__dirname, 'updates'),
	isUpdated: file => history.includes(file),
	afterUpdate: (context, update) => updated.push(update.__file)
});

updater.apply().then(result => {
	console.log('updates:', result.updates);
	console.log('skips:', result.skips);
	console.log('updated:', updated);
	// =>
	// updates: 3
	// skips: 1
	// updated: [ '0.0.2-updates', '0.3.0-updates', '1.0.0-updates' ]
});
```

## API

### `new dupdate.Updater(options)` or `dupdate(options)`

create a Updater instance. 

#### options

* path: `string` - path to contain updates scripts. Defaults to `./updates`
* exitOnFailure: `boolean` - exit current process if failure. Defaults to `true`
* silent: `boolean` - do not show message for executing. Defaults to `faslse`
* context: `object` - the context object for passing to update script. Defaults to `{}`
* isUpdated: `function(file: string, [callback]) => [Promise]` - the function to check the update found whether has been applied.
* afterUpdate: `function(context: object, update: function, [callback]) => [Promise]` the callback for one update script has been applied.

### `Updater.prototype.apply(callback) => [Promise]`

Apply updates with callback function or return a Promise.
 
The result returned in `callback(err, result)` or for `.then(result => ...)` is an Object:

#### result
* context: `object` - the context from constructor
* updates: `number` - the updated count
* skips: `number` - the skipped count

## Credits

* [Yuan Tao](https://github.com/taoyuan)
* [Dom Harrington](https://github.com/domharrington/)
* [KeystoneJS](http://keystonejs.com/docs/getting-started/#runningyourapp-writingupdates) - for the concept

## License

MIT © [Yuan Tao](https://github.com/taoyuan)
