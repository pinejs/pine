/*!
 * utility - utility.js
 *
 */

"use strict";

var utils = [
  require('./function'),
  require('./immediate'),
  require('./crypto'),
  require('./optimize'),
  require('./object'),
  require('./web'),
  require('./homedir')
]

var utilities = {};
for (const util of utils) {
  Object.assign(utilities, util);
}

module.exports = utilities;
