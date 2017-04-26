'use strict';

/**
 * Simple Ioc container inspired by pimple
 */
class Ioc {
  constructor(){
    this._cache = new Map();
    this._factoryCache = new Map();
  }

  /**
   * Register a named service to container
   *
   * @param {String} name - service name
   * @param {Function} service - service definition
   * @return {Object} this
   */
  register(name, service){
    if(this._cache[name]){
      debug('[warn] service is registered before: ' + name);
      return;
    }
    this._cache[name] = service;
    return this;
  }

  /**
   * Register a named service to container
   *
   * @param {String} name - service name
   * @param {Function} serviceFactory - service factory definition
   * @return {Object} this
   */
  factory(name, serviceFactory){
    if(this._factoryCache[name]){
      debug('[warn] service factory is registered before: ' + name);
      return;
    }
    this._factoryCache[name] = service;
    return this;
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
