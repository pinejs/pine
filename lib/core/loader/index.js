'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const isFunction = require('is-type-of').function;
const debug = require('debug')('pine:loader');
const _ = require('lodash');
const utils = require('../../utils');

class Loader {
  /**
   * @constructor
   * @param {Object} options - options
   * @param {String} options.baseDir - the directory of application
   * @param {Object} options.app - Application instance
   * @param {Logger} options.logger - logger
   * @since 1.0.0
   */
  constructor(options){
    this.options = options;
    assert(fs.existsSync(this.options.baseDir), `${this.options.baseDir} not exists`);
    assert(this.options.app, 'options.app is required');
    assert(this.options.logger, 'options.logger is required');
    debug('Loader options %j', options);

    this.app = this.options.app;
    /**
     * @member {Object} Loader#pkg
     * @see {@link AppInfo#pkg}
     * @since 1.0.0
     */
    this.pkg = require(path.join(this.options.baseDir, 'package.json'));

    /**
     * @member {String} Loader#serverEnv
     * @see AppInfo#env
     * @since 1.0.0
     */
    this.serverEnv = this.getServerEnv();
    debug('Loaded serverEnv %j', this.serverEnv);

    /**
     * @member {AppInfo} Loader#appInfo
     * @since 1.0.0
     */
    this.appInfo = this.getAppInfo();
  }

  /**
   * Get {@link AppInfo#name}
   * @return {String} appname
   * @private
   * @since 1.0.0
   */
  getAppname() {
    if (this.pkg.name) {
      debug('Loaded appname(%s) from package.json', this.pkg.name);
      return this.pkg.name;
    }
    const pkg = path.join(this.options.baseDir, 'package.json');
    throw new Error(`name is required from ${pkg}`);
  }

  /**
   * Get {@link AppInfo#env}
   * @return {String} env
   * @see AppInfo#env
   * @private
   * @since 1.0.0
   */
  getServerEnv() {
    let env = process.env;
    return env.PINE_ENV || env.NODE_ENV || 'dev';
  }

  /**
   * Get app info
   * @return {AppInfo} appInfo
   * @since 1.0.0
   */
  getAppInfo() {
    const env = this.serverEnv;
    const home = utils.homedir();
    const baseDir = this.options.baseDir;

    /**
     * Meta infomation of the application
     * @class AppInfo
     */
    return {
      /**
       * The name of the application, retreive from the name property in `package.json`.
       * @member {String} AppInfo#name
       */
      name: this.getAppname(),

      /**
       * The current directory, where the application code is.
       * @member {String} AppInfo#baseDir
       */
      baseDir,

      /**
       * The environment of the application, **it's not NODE_ENV**
       *
       * 1. from PINE_ENV
       * 2. from NODE_ENV
       *
       * env | description
       * ---       | ---
       * test      | system integration testing
       * prod      | production
       * dev       | developement
       *
       * @member {String} AppInfo#env
       */
      env,

      /**
       * The use directory, same as `process.env.HOME`
       * @member {String} AppInfo#HOME
       */
      HOME: home,

      /**
       * parsed from `package.json`
       * @member {Object} AppInfo#pkg
       */
      pkg: this.pkg
    };
  }

  /**
   * Load a file
   */
  loadFile(filepath){
    if (!fs.existsSync(filepath)) {
      return null;
    }

    try {
      const obj = require(filepath);
      if (!obj) return obj;
      // it's es module
      if (obj.__esModule) return 'default' in obj ? obj.default : obj;
      return obj;
    } catch (err) {
      err.message = '[error] load file: ' + filepath + ', error: ' + err.message;
      throw err;
    }
  }

  /**
   * Load file path in dir recursively
   */
  _walk(dir) {
      const exist = fs.existsSync(dir);
      if (!exist) {
          return;
      }

      const files = fs.readdirSync(dir);
      let list = [];

      for (let file of files) {
        if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
          list = list.concat(this._walk(path.resolve(dir, file)));
        } else {
          list.push(path.resolve(dir, file));
        }
      }

      return list;
  }

}

/**
 * Mixin methods to Loader
 * // ES6 Multiple Inheritance
 * https://medium.com/@leocavalcante/es6-multiple-inheritance-73a3c66d2b6b
 */
const loaders = [
  require('./config'),
  require('./model'),
  require('./service'),
  require('./controller'),
  require('./router'),
];

for (const loader of loaders) {
  Object.assign(Loader.prototype, loader);
}

module.exports = Loader;
