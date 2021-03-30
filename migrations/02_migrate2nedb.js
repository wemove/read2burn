"use strict";

const path = require("path"),
  fs = require("extfs"),
  rimraf = require("rimraf"),
  Bluebird = require("bluebird");

const app = require("../app");

module.exports = {
  up: function () {
    /*eslint no-unused-vars: "warn"*/
    return new Bluebird(function (resolve, reject) {
      console.log("MIGRATION 02_migrate2nedb.js: start migration to nedb.");
      const nedb = app.nedb;
      const dbPath = path.resolve(__dirname, "../data");
      fs.readdirSync(dbPath).forEach((item) => {
        const dirPath = path.resolve(dbPath, item);
        const dirStat = fs.statSync(dirPath);
        if (dirStat.isDirectory()) {
          if (fs.isEmptySync(dirPath)) {
            rimraf(dirPath, function () {
              console.log(`Removed empty directory: ${dirPath}`);
            });
          } else {
            fs.readdirSync(dirPath).forEach((item) => {
              const filePath = path.resolve(dirPath, item);
              const fileStat = fs.statSync(filePath);
              const timestamp = new Date(fileStat.ctime).getTime();
              const key = path.basename(filePath);
              // get data and insert into nedb
              const data = fs.readFileSync(filePath, "utf8");
              const encrypted = JSON.parse(data).encrypted;
              const entry = { key, timestamp, encrypted };
              console.log(`Inserting secret: ${key}`);
              nedb.insert(entry);
              // clean up file and empty directory
              rimraf.sync(filePath);
              if (fs.isEmptySync(dirPath)) {
                rimraf.sync(dirPath);
                console.log(`Removed empty directory: ${dirPath}`);
              }
            });
          }
        }
      });
      console.log("MIGRATION 02_migrate2nedb.js: finish migration to nedb.");
      resolve();
    });
  },
};
