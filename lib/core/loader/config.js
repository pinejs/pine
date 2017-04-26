'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('pine:loader');

module.exports = {
  /**
   * Load conf/config.${NODE_ENV}.js, auto merge config.default.fs if exists
   */
  loadConfig(){
    let filename = process.env.NODE_ENV || 'dev';
    debug('loading conf/config.default.js');
    let config = this.loadFile(path.join(this.options.baseDir, 'conf/config.default.js')) || {};
    if (filename !== 'default') {
      try {
        debug(`loading conf/config.${filename}.js`);
        config = _.extend(config, this.loadFile(path.join(this.options.baseDir, `conf/config.${filename}.js`)));
      } catch (e) {
        throw e;
      }
    }
    this.config = config;
  }
}
