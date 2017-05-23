'use strict';

const debug = require('debug');

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
