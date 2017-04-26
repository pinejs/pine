/*!
 * utility - homedir.js
 *
 */

"use strict";

const os = require('os');

exports.homedir = function() {
  if (os.userInfo && os.userInfo().homedir) {
    return os.userInfo().homedir;
  } else if (os.homedir) {
    return os.homedir();
  }
  return process.env.HOME;
}
