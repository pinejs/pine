"use strict";

const util = require("../utils");
const inject = require("./inject");
/**
 * Create an instance of a class which constructor has arguments
 * decorated with `@inject`.
 *
 * The function returns a class when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param ctor The class constructor to call.
 * @param ctx The context containing values for `@inject` resolution
 */
exports.instantiateClass = function instantiateClass(ctor, ctx) {
    const argsOrPromise = resolveInjectedArguments(ctor, ctx);
    if (util.isPromise(argsOrPromise)) {
        return argsOrPromise.then(args => new ctor(...args));
    }
    else {
        return new ctor(...argsOrPromise);
    }
}

/**
 * Given a function with arguments decorated with `@inject`,
 * return the list of arguments resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param fn The function for which the arguments should be resolved.
 * @param ctx The context containing values for `@inject` resolution
 */
exports.resolveInjectedArguments = function resolveInjectedArguments(fn, ctx) {
    // NOTE: the array may be sparse, i.e.
    //   Object.keys(injectedArgs).length !== injectedArgs.length
    // Example value:
    //   [ , 'key1', , 'key2']
    const injectedArgs = inject.describeInjectedArguments(fn);
    const args = new Array(fn.length);
    let asyncResolvers = undefined;
    for (let ix = 0; ix < fn.length; ix++) {
        const bindingKey = injectedArgs[ix];
        if (!bindingKey) {
            throw new Error(`Cannot resolve injected arguments for function ${fn.name}: ` +
                `The argument ${ix + 1} was not decorated for dependency injection.`);
        }
        const binding = ctx.getBinding(bindingKey);
        const valueOrPromise = binding.getValue(ctx);
        if (util.isPromise(valueOrPromise)) {
            if (!asyncResolvers)
                asyncResolvers = [];
            asyncResolvers.push(valueOrPromise.then((v) => args[ix] = v));
        }
        else {
            args[ix] = valueOrPromise;
        }
    }
    if (asyncResolvers) {
        return Promise.all(asyncResolvers).then(() => args);
    }
    else {
        return args;
    }
}
