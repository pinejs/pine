/*!
 * utility - object.js
 *
 */

'use strict';

/**
 * check module exists
 * @param {String} filepath - module name or filepath
 */
exports.existsModule = function(filepath) {
  try {
    require.resolve(filepath);
    return true;
  } catch (e) {
    return false;
  }
}
