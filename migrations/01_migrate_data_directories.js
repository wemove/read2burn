"use strict";

var Bluebird = require("bluebird");
var fs = require("extfs");
var rimraf = require("rimraf");
var path = require("path");
var mv = require("mv");
const dir = path.resolve(__dirname, "../data");

module.exports = {
  up: function () {
    /*eslint no-unused-vars: "warn"*/
    return new Bluebird(function (resolve, reject) {
      console.log(
        "MIGRATION 01_migrate_data_directories.js: Migrating old long data directories to 3 character directories."
      );
      // Describe how to achieve the task.
      // rename data directories to the 3 characters

      fs.readdirSync(dir).forEach((it) => {
        const itsPath = path.resolve(dir, it);
        const itsStat = fs.statSync(itsPath);

        if (itsStat.isDirectory()) {
          if (fs.isEmptySync(itsPath)) {
            rimraf(itsPath, function () {
              console.log("Removed empty directory:  " + itsPath);
            });
          } else {
            var lastPath = path.basename(itsPath);
            if (lastPath.length > 3) {
              var shortendPath = itsPath.replace(
                lastPath,
                lastPath.substr(0, 3)
              );
              if (fs.existsSync(shortendPath)) {
                // Move all file to shortend path
                fs.readdirSync(itsPath).forEach((it) => {
                  var srcPath = path.resolve(itsPath, it);
                  var dstPath = path.join(shortendPath, path.basename(srcPath));
                  if (fs.existsSync(dstPath)) {
                    console.warn(
                      "File '" + dstPath + "' exists. Overwriting it!"
                    );
                  }
                  mv(srcPath, dstPath, function (err) {
                    console.log(
                      'Moved file "' + srcPath + '" -> "' + dstPath + '"'
                    );

                    // done. it tried fs.rename first, and then falls back to
                    // piping the source file to the dest file and then unlinking
                    // the source file.
                    if (err) console.log(err);
                  });
                });
                if (fs.isEmptySync(itsPath)) {
                  rimraf(itsPath, function () {
                    console.log("Removed empty directory:  " + itsPath);
                  });
                }
              } else {
                mv(itsPath, shortendPath, function (err) {
                  // done. it tried fs.rename first, and then falls back to
                  // piping the source file to the dest file and then unlinking
                  // the source file.
                  console.log(
                    'Moved directory "' +
                      itsPath +
                      '" -> "' +
                      shortendPath +
                      '"'
                  );
                  if (err) console.log(err);
                });
              }
            }
          }
        }
      });
      // Call resolve/reject at some point.
      resolve();
    });
  },

  down: function () {
    return new Bluebird(function (resolve, reject) {
      console.log("01_migrate_data_directories.js:down");
      // Describe how to revert the task.
      // Call resolve/reject at some point.
      reject();
    });
  },
};
