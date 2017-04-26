'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('pine:loader');
const Router = require('../router');

module.exports = {
  /**
   * Load app/controller/*
   * @since 1.0.0
   */
  loadRouter(){
    let routerFile = path.join(this.options.baseDir, 'app/router.js');
    this.loadFile(routerFile)(this.app);
    debug('loaded router: %s', routerFile);
  }
}
