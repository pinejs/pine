'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var assert = require('assert');
var fs = require('fs');
var Koa = require('koa');
var convert = require('koa-convert');
var debug = require('debug')('pine');
var is = require('is-type-of');
var co = require('co');
var utils = require('./utils');
var logger = require('./core/logger');
var Loader = require('./core/loader');
var Router = require('./core/router');
var ROUTER = Symbol('Pine#router');
var BEFORE_START = Symbol('Pine#beforeStart');
var AFTER_START = Symbol('Pine#afterStart');

var Application = function (_Koa) {
  _inherits(Application, _Koa);

  /**
   * @constructor
   * @param {Object} options - options
   * @param {String} [options.baseDir=process.cwd()] - the directory of application
   * @param {String} [options.type=application|agent] - wheter it's running in app worker or agent worker
   * @param {Object} [options.plugins] - custom plugins
   * @since 1.0.0
   */
  function Application() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Application);

    options.baseDir = options.baseDir || process.cwd();
    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
    assert(fs.existsSync(options.baseDir), 'Directory ' + options.baseDir + ' not exists');
    assert(fs.statSync(options.baseDir).isDirectory(), 'Directory ' + options.baseDir + ' is not a directory');

    /**
     * @member {Object} Pine#_options
     * @private
     * @since 1.0.0
     */
    var _this = _possibleConstructorReturn(this, (Application.__proto__ || Object.getPrototypeOf(Application)).call(this));

    _this.options = options;

    /**
     * logging for Pine, avoid using console directly
     * @member {Logger} Pine#console
     * @private
     * @since 1.0.0
     */
    _this.logger = logger.getDefaultLogger();

    /**
     * The loader instance, the default class is {@link Loader}.
     * If you want define
     * @member {Loader} Pine#loader
     * @since 1.0.0
     */
    _this.loader = new Loader({
      baseDir: options.baseDir,
      app: _this,
      logger: _this.logger
    });

    //beforeStart & afterStart
    _this[BEFORE_START] = _this[AFTER_START] = [];

    //load whole app
    _this.loadApp();
    return _this;
  }

  /**
   * The current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */


  _createClass(Application, [{
    key: 'url',


    /**
     * Alias to {@link Router#url}
     * @param {String} name - Router name
     * @param {Object} params - more parameters
     * @return {String} url
     */
    value: function url(name, params) {
      return this.router.url(name, params);
    }

    /**
     * Before hooks of Application
     * @param {Function} fn - Function
     */

  }, {
    key: 'beforeStart',
    value: function beforeStart(fn) {
      this[BEFORE_START].push(fn);
    }

    /**
     * After hooks of Application
     * @param {Function} fn - Function
     */

  }, {
    key: 'afterStart',
    value: function afterStart(fn) {
      this[AFTER_START].push(fn);
    }

    /**
     * Load app from options.baseDir
     */

  }, {
    key: 'loadApp',
    value: function loadApp() {
      this.loader.loadConfig();
      this.loader.loadModel();
      this.loader.loadService();
      this.loader.loadController();
      this.loader.loadRouter();
    }

    /**
     * start app and listen on port
     */

  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      this[BEFORE_START].forEach(function (fn) {
        fn.apply(null, _this2);
      });

      this.listen(this.config.port);
      this.on('error', function (err) {
        return console.error('server error: ', err);
      });
      debug('App started and listening on port: %s', this.config.port);

      this[AFTER_START].forEach(function (fn) {
        fn.apply(null, _this2);
      });
    }
  }, {
    key: 'baseDir',
    get: function get() {
      return this.options.baseDir;
    }

    /**
     * The name of application
     * @member {String}
     * @see {@link AppInfo#name}
     * @since 1.0.0
     */

  }, {
    key: 'name',
    get: function get() {
      return this.loader.pkg.name;
    }

    /**
     * The configuration of application
     * @member {Config}
     * @since 1.0.0
     */

  }, {
    key: 'config',
    get: function get() {
      return this.loader.config;
    }

    /**
     * The model of application
     * @member {Model}
     * @since 1.0.0
     */

  }, {
    key: 'model',
    get: function get() {
      return this.loader.model;
    }

    /**
     * The service of application
     * @member {Service}
     * @since 1.0.0
     */

  }, {
    key: 'service',
    get: function get() {
      return this.loader.service;
    }

    /**
     * The controller of application
     * @member {Controller}
     * @since 1.0.0
     */

  }, {
    key: 'controller',
    get: function get() {
      return this.loader.controller;
    }

    /**
     * get router
     * @member {Router} Pine#router
     * @since 1.0.0
     */

  }, {
    key: 'router',
    get: function get() {
      if (this[ROUTER]) {
        return this[ROUTER];
      }
      var router = this[ROUTER] = new Router({ sensitive: true }, this);
      // register router middleware
      this.use(router.middleware());
      return router;
    }
  }]);

  return Application;
}(Koa);

// delegate all router method to application


['head', 'options', 'get', 'put', 'patch', 'post', 'delete', 'all', 'resources', 'register', 'redirect'].forEach(function (method) {
  Application.prototype[method] = function () {
    var _router;

    (_router = this.router)[method].apply(_router, arguments);
    return this;
  };
});

module.exports = Application;