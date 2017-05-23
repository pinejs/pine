"use strict";

const assert = require("assert");
require("reflect-metadata");
const REFLECTION_KEY = 'inject';

/**
 * A decorator to annotate method arguments for automatic injection
 * by Pine IoC container.
 *
 * Usage - Javascript:
 *
 * ```js
 * class InfoController {
 *   constructor(@inject('application.name') public appName: string) {
 *   }
 *   // ...
 * }
 * ```
 *
 * Usage - JavaScript:
 *
 *
 * @param bindingKey What binding to use in order to resolve the value
 * of the annotated argument.
 */
exports.inject = function inject(bindingKey) {
  return function markArgumentAsInjected(target, propertyKey, parameterIndex) {
    assert(parameterIndex != undefined, '@inject decorator can be used on function arguments only!');
    const injectedArgs = Reflect.getOwnMetadata(REFLECTION_KEY, target, propertyKey) || [];
    injectedArgs[parameterIndex] = bindingKey;
    Reflect.defineMetadata(REFLECTION_KEY, injectedArgs, target, propertyKey);
  };
}

exports.describeInjectedArguments = function describeInjectedArguments(target) {
  return Reflect.getOwnMetadata(REFLECTION_KEY, target) || [];
}
