'use strict';

const assert = require('assert');
/**
 * Base Controller
 */
class Controller {
  constructor(options){
    this.options = options;
    assert(this.options.app, 'options.app is required');
    this.app = this.options.app;
  }
}

module.exports = Controller;
