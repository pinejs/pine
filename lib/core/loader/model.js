'use strict';

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('pine:loader');
const utils = require('../../utils');
const heartEvent = new EventEmitter();

module.exports = {
  /**
   * Load app/model/*
   * @since 1.0.0
   */
  loadModel(){
    if(utils.existsModule('mongoose')){
      this._initMongoose();
    } else if(utils.existsModule('sequelize')){
      this._initSequelize();
    } else {
      this.app.logger.warn('Not supported orm, supported [mongoose|sequelize]');
      return;
    }

    let model = {};
    let excludes = this.app.options.excludes.model || [];
    let files = this._walk(path.join(this.options.baseDir, 'app/model'));
    files.forEach( (f) => {
      if(_.includes(excludes, path.basename(f))){
        debug("[ignored] load model: %s", f);
        return
      };
      debug('loaded model: ', f);
      let Model = this.loadFile(f);
      let modelName = _.capitalize(path.basename(f,'.js'));
      let m = new Model({app: this.app});
      model[modelName] = this.app.mongoose.model(modelName, m.getSchema());
    })
    this.model = model;

    this.app.beforeStart( () => {
      this.app.logger.info('[pine-mongoose] starting...');
      heartEvent.on('connected', () => {
        this.app.logger.info('[pine-mongoose] start successfully and server status is ok');
      })
    });
  },

  _initMongoose(){
    const mongoose = require('mongoose');
    const config = this.app.config.mongo;
    const logger = this.app.logger;

    // Use native promises
    mongoose.Promise = global.Promise;
    logger.info(`[pine-mongoose] ${config.url} try to connect`);
    const db = mongoose.createConnection(config.url, config.options);
    db.Schema = mongoose.Schema;
    this.app.mongoose = db;

    db.on('error', function (err) {
      if (err) {
        logger.error(`[pine-mongoose] ${config.url} connect failed`);
        logger.error(err.message);
        process.exit(1);
      }
    });
    db.on('disconnected', () => {
      logger.error(`[pine-mongoose] ${config.url} disconnected`);
    });

    db.on('connected', () => {
      logger.info(`[pine-mongoose] ${config.url} connected successfully`);
      heartEvent.emit('connected');
    });

    db.on('reconnected', () => {
      logger.info(`[pine-mongoose] ${config.url} reconnected successfully`);
    });

    return db;
  }
}
