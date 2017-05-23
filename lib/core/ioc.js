'use strict';

/**
 * Ioc container
 */
class Ioc {
  /**
   * create an Ioc container
   * @param {Ioc} parent - parent Ioc container
   */
  constructor(parent){
    this.registry = new Map();
    this.parent = parent;
  }

  /**
   * Register a named binding to container
   *
   * @param {String} key - binding name
   * @return {Object} Binding
   */
  bind(key){
    if(this.registry[name]){
      debug('[warn] service is registered before: ' + name);
      return;
    }
    this.registry[name] = service;
    return this;
  }

  /**
   * Check whether container contains the named binding
   * @param {String} key - binding name
   */
  contains(key){
    return this.registry.has(key);
  }

  /**
   * Get a named service from container
   * if service is defined by service factory, then return the service instance by invoke service factory function
   * if service is not defined by service factory, then return the singleton service instance
   *
   * @param {String} name - service name
   * @return {Object|Function} service instance
   */
  get(name){
    if(typeof this._factoryCache[name] === 'function'){
      return this._factoryCache[name]();
    }
    return this._cache[name] || null;
  }

  /**
   * Get all service's names from container
   *
   * @return {Array} service's names includes service instance and service factory instance
   */
  getAll(){
    return this._cache.keys().concat(this._factoryCache.keys());
  }

}

class Binding {
  constructor(_key, isLocked = false) {
      this._key = _key;
      this.isLocked = isLocked;
  }
  get key() { return this._key; }
  get tagName() { return this._tagName; }
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
   * ```
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
  tag(tagName) {
      this._tagName = tagName;
      return this;
  }
  /**
   * Bind the key to a constant value.
   *
   * @param value The bound value.
   *
   * @example
   *
   * ```ts
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
   * ```ts
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
      this.getValue = context => resolver_1.instantiateClass(ctor, context);
      this.valueConstructor = ctor;
      return this;
  }
  unlock() {
      this.isLocked = false;
      return this;
  }
}
