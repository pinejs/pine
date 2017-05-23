/*!
 * utility - utility.js
 *
 */

"use strict";

var utils = [require('./function'), require('./immediate'), require('./crypto'), require('./optimize'), require('./object'), require('./web'), require('./homedir'), require('./module')];

var utilities = {};
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = utils[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var util = _step.value;

    Object.assign(utilities, util);
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

module.exports = utilities;