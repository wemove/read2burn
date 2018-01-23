'use strict';

var Bluebird = require('bluebird');

module.exports = {
  up: function () {
    return new Bluebird(function (resolve, reject) {
      console.log( "01_migrate_data_directories.js:up")
      // Describe how to achieve the task.
      // Call resolve/reject at some point.
      return true;
    });
  },

  down: function () {
    return new Bluebird(function (resolve, reject) {
        console.log( "01_migrate_data_directories.js:down")
        // Describe how to revert the task.
      // Call resolve/reject at some point.
    });
  }
};