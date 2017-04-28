'use strict';

const fs = require('fs');
const path = require('path');
const is = require('is-type-of');
const _ = require('lodash');
const debug = require('debug')('pine:loader');

module.exports = {
  /**
   * Load app/controller/*
   * @since 1.0.0
   */
  loadController(){
    let controller = {};
    let excludes = this.app.options.excludes.controller || [];
    let files = this._walk(path.join(this.options.baseDir, 'app/controller'));
    files.forEach( (f) => {
      if(_.includes(excludes, path.basename(f))){
        debug("[ignored] load controller: %s", f);
        return
      };
      debug('loaded controller: ', f);
      let Controller = this.loadFile(f);
      let controllerName = path.basename(f,'.js');
      let obj;
      if (is.function(Controller) && !is.generatorFunction(Controller) && !is.class(Controller)) {
        obj = Controller({app: this.app});
      }
      if (is.class(Controller)) {
        obj = wrapClass(Controller, this.app);
      }
      controller[controllerName] = obj;
    })
    this.controller = controller;
  }
}

// wrap the class, yield a object with middlewares
function wrapClass(Controller, app) {
  const keys = Object.getOwnPropertyNames(Controller.prototype);
  const ret = {};
  //default inject app
  Object.assign(Controller.prototype, {app});
  const c = new Controller();
  for (const key of keys) {
    // getOwnPropertyNames will return constructor
    // that should be ignored
    if (key === 'constructor') {
      continue;
    }
    if (is.function(Controller.prototype[key])) {
      ret[key] = c[key].bind(c);
    }
  }
  return ret;
}
