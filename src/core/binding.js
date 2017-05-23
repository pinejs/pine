"use strict";

const resolver = require("./resolver");
// FIXME(bajtos) The binding class should be parameterized by the value type stored

class Binding {
    constructor(_key, isLocked = false) {
        this._key = _key;
        this.isLocked = isLocked;
    }
    get key() { return this._key; }
    get aliasName() { return this._aliasName; }
    /**
     * This is an internal function optimized for performance.
     * Users should use `@inject(key)` or `ctx.get(key)` instead.
     *
     * Get the value bound to this key. Depending on `isSync`, this function returns either:
     *  - the bound value
     *  - a promise of the bound value
     *
     * Consumers wishing to consume sync values directly should use `isPromise`
     * to check the type of the returned value to decide how to handle it.
     *
     * ```js
     * const result = binding.getValue(ctx);
     * if (isPromise(result)) {
     *   result.then(doSomething)
     * } else {
     *   doSomething(result);
     * }
     * ```
     */
    getValue(ctx) {
        return Promise.reject(new Error(`No value was configured for binding ${this._key}.`));
    }

    lock() {
        this.isLocked = true;
        return this;
    }

    alias(aliasName) {
        this._aliasName = aliasName;
        return this;
    }

    /**
     * Bind the key to a constant value.
     *
     * @param value The bound value.
     *
     * @example
     *
     * ```js
     * ctx.bind('appName').to('CodeHub');
     * ```
     */
    to(value) {
        this.getValue = () => value;
        return this;
    }

    /**
     * Bind the key to a computed (dynamic) value.
     *
     * @param factoryFn The factory function creating the value.
     *   Both sync and async functions are supported.
     *
     * @example
     *
     * ```js
     * // synchronous
     * ctx.bind('now').toDynamicValue(() => Date.now());
     *
     * // asynchronous
     * ctx.bind('something').toDynamicValue(
     *  async () => Promise.delay(10).then(doSomething)
     * );
     * ```
     */
    toDynamicValue(factoryFn) {
        // TODO(bajtos) allow factoryFn with @inject arguments
        this.getValue = (ctx) => factoryFn();
        return this;
    }

    /**
     * Bind the key to an instance of the given class.
     *
     * @param ctor The class constructor to call. Any constructor
     *   arguments must be annotated with `@inject` so that
     *   we can resolve them from the context.
     */
    toClass(ctor) {
        this.getValue = context => resolver.instantiateClass(ctor, context);
        this.valueConstructor = ctor;
        return this;
    }

    unlock() {
        this.isLocked = false;
        return this;
    }
}

exports.Binding = Binding;
