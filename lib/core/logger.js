'use strict';

const assert = require('assert');
const winston = require('winston');

module.exports = {
  /**
   * Return a winston logger instance
   *
   * @param {Object} options -
   *  @param {Boolean} options.console - [true|false]
   *  @param {Object}  options.file -
   * @return logger instance
   */
  getLogger(options = {}){
    assert(options, 'options is required');
    let level = options.level || 'info';
    let transports = [];
    if(options.console){
      transports.push(new winston.transports.Console());
    }
    if(options.file){
      let filename = options.file.filename;
      transports.push(new winston.transports.File({filename: filename}));
    }
    return new winston.Logger({level: level,  transports: transports, exitOnError: false});
  },

  /**
   * Return default system logger instance
   * @return logger instance
   */
  getDefaultLogger(level = 'info'){
    return module.exports.getLogger({
      console: true,
      file: {
        filename: 'logs/pine.log'
      }
    })
  }
}
