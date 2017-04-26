'use strict';

const assert = require('assert');

/**
 * Base Model
 */
class Model {
  constructor(options){
    this.options = options;
    assert(this.options.app, 'options.app is required');
    assert(this.options.app.mongoose, 'options.app.mongoose is required');
    this.app = this.options.app;
    this.logger = this.app.logger;
  }

  defineSchema(definition){
    this.schema = this.app.mongoose.Schema(definition);
  }

  plugin(fn){
    this.schema.plugin(fn);
  }

  virtual(name, options){
    this.schema.virtual(name, options);
  }

  static(method, fn){
    this.schema.static(method, fn);
  }

  pre(method, fn){
    this.schema.pre(method, fn);
  }

  post(method, fn){
    this.schema.post(method, fn);
  }

  index(definition){
    this.schema.index(definition);
  }

  getSchema(){
    return this.schema;
  }
}

module.exports = Model;
