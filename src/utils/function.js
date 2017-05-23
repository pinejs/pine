/*!
 * utility - function.js
 *
 */

"use strict";

/**
 * A empty function.
 *
 * @return {Function}
 * @public
 */
exports.noop = function noop() {};

/**
 * Get a function parameter's names.
 *
 * @param {Function} func
 * @param {Boolean} [useCache], default is true
 * @return {Array} names
 */
exports.getParamNames = function getParamNames(func, cache) {
  cache = cache !== false;
  if (cache && func.__cache_names) {
    return func.__cache_names;
  }
  var str = func.toString();
  var names = str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g) || [];
  func.__cache_names = names;
  return names;
};

/**
 * Check whether a function is generator.
 *
 * @param  {Function} fn
 * @return {Boolean}
 */
exports.isGeneratorFunction = function isGeneratorFunction(fn) {
  return typeof fn === 'function' &&
      fn.constructor &&
      fn.constructor.name === 'GeneratorFunction'
};

/**
 * Check whether a function is Promise
 *
 * @param {Object} value
 */
exports.isPromise = function(value) {
    if (!value)
        return false;
    if (typeof value !== 'object' && typeof value !== 'function')
        return false;
    return typeof value.then === 'function';
}
