'use strict';

const assert = require('assert');
const fs = require('fs');
const Koa = require('koa');
const convert = require('koa-convert');
const debug = require('debug')('pine');
const is = require('is-type-of');
const co = require('co');
const utils = require('./utils');
const logger = require('./core/logger');
const Loader = require('./core/loader');
const Router = require('./core/router');
const ROUTER = Symbol('Pine#router');
const BEFORE_START = Symbol('Pine#beforeStart');
const AFTER_START = Symbol('Pine#afterStart');

class Application extends Koa {

  /**
   * @constructor
   * @param {Object} options - options
   * @param {String} [options.baseDir=process.cwd()] - the directory of application
   * @param {String} [options.type=application|agent] - wheter it's running in app worker or agent worker
   * @param {Object} [options.plugins] - custom plugins
   * @since 1.0.0
   */
  constructor(options={}){
    options.baseDir = options.baseDir || process.cwd();
    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
    assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
    assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

    super();

    /**
     * @member {Object} Pine#_options
     * @private
     * @since 1.0.0
     */
    this.options = options;

    /**
     * logging for Pine, avoid using console directly
     * @member {Logger} Pine#console
     * @private
     * @since 1.0.0
     */
    this.logger = logger.getDefaultLogger();

    /**
     * The loader instance, the default class is {@link Loader}.
     * If you want define
     * @member {Loader} Pine#loader
     * @since 1.0.0
     */
    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
      logger: this.logger
    });

    //beforeStart & afterStart
    this[BEFORE_START] = this[AFTER_START] = [];

    //load whole app
    this.loadApp();
  }

  /**
   * The current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */
  get baseDir() {
    return this.options.baseDir;
  }

  /**
   * The name of application
   * @member {String}
   * @see {@link AppInfo#name}
   * @since 1.0.0
   */
  get name() {
    return this.loader.pkg.name;
  }

  /**
   * The configuration of application
   * @member {Config}
   * @since 1.0.0
   */
  get config() {
    return this.loader.config;
  }

  /**
   * The model of application
   * @member {Model}
   * @since 1.0.0
   */
  get model(){
    return this.loader.model;
  }

  /**
   * The service of application
   * @member {Service}
   * @since 1.0.0
   */
  get service(){
    return this.loader.service;
  }

  /**
   * The controller of application
   * @member {Controller}
   * @since 1.0.0
   */
  get controller(){
    return this.loader.controller;
  }

  /**
   * get router
   * @member {Router} Pine#router
   * @since 1.0.0
   */
  get router() {
    if (this[ROUTER]) {
      return this[ROUTER];
    }
    const router = this[ROUTER] = new Router({ sensitive: true }, this);
    // register router middleware
    this.use(router.middleware());
    return router;
  }

  /**
   * Alias to {@link Router#url}
   * @param {String} name - Router name
   * @param {Object} params - more parameters
   * @return {String} url
   */
  url(name, params) {
    return this.router.url(name, params);
  }

  /**
   * Before hooks of Application
   * @param {Function} fn - Function
   */
  beforeStart(fn){
    this[BEFORE_START].push(fn);
  }

  /**
   * After hooks of Application
   * @param {Function} fn - Function
   */
  afterStart(fn){
    this[AFTER_START].push(fn);
  }

  /**
   * Load app from options.baseDir
   */
  loadApp(){
    this.loader.loadConfig();
    this.loader.loadModel();
    this.loader.loadService();
    this.loader.loadController();
    this.loader.loadRouter();
  }

  /**
   * start app and listen on port
   */
  start(){
    this[BEFORE_START].forEach( (fn) => {
      fn.apply(null, this);
    });

    this.listen(this.config.port);
    this.on('error', err =>
      console.error('server error: ', err)
    );
    
    this[AFTER_START].forEach( (fn) => {
      fn.apply(null, this);
    });
    debug('App started and listening on port: %s', this.config.port);
  }
}

// delegate all router method to application
(['head', 'options', 'get', 'put', 'patch', 'post', 'delete', 'all', 'resources', 'register', 'redirect' ]).forEach(method => {
  Application.prototype[method] = function(...args) {
    this.router[method](...args);
    return this;
  };
});

module.exports = Application;
