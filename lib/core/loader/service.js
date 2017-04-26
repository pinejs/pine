'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('pine:loader');

module.exports = {
  /**
   * Load app/service/*
   * @since 1.0.0
   */
  loadService(){
    let service = {};
    let excludes = this.app.options.excludes.service || [];
    let files = this._walk(path.join(this.options.baseDir, 'app/service'));
    files.forEach( (f) => {
      if(_.includes(excludes, path.basename(f))){
        debug("[ignored] load services: %s", f);
        return
      };
      debug('loaded service: ', f);
      let Service = this.loadFile(f);
      let serviceName = _.capitalize(path.basename(f,'.js'));
      service[serviceName] = new Service({app: this.app});
    })
    this.service = service;
  }
}
