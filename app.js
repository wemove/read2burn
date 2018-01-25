
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , Umzug = require('umzug')
  , fs = require('extfs')
  , rimraf = require('rimraf')
  , cron = require('node-cron');

var umzug = new Umzug();
var app = express();
var i18n = require("i18n");

// default: using 'accept-language' header to guess language settings
app.use(i18n.init);
app.set('port', process.env.PORT || 3300);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.Router());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.enable('trust proxy');

i18n.configure({
  locales: ['en', 'de'],
  directory: __dirname + '/locales',
  defaultLocale: 'en'
});

app.get('/', routes.index);
app.post('/', routes.index);

umzug.up().then(function (migrations) {
  // "migrations" will be an Array with the names of the
  // executed migrations.
});


http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

cron.schedule('12 1 * * *', function () {
  console.log("Cleanup...")
  var dbPath = path.resolve(__dirname, "data");
  fs.readdirSync(dbPath).forEach(it => {
    const dirPath = path.resolve(dbPath, it);
    const dirStat = fs.statSync(dirPath);

    if (dirStat.isDirectory()) {
      if (fs.isEmptySync(dirPath)) {
        var now = new Date().getTime();
        var endTime = new Date(dirStat.ctime).getTime() + 3600; // in ms (3600000 = 1 hour)
        if (now > endTime) {
          rimraf(dirPath, function () {
            console.log('Cleanup: removed empty directory:  ' + dirPath);
          });
        }
      } else {
        fs.readdirSync(dirPath).forEach(it => {
          const filePath = path.resolve(dirPath, it);
          const fileStat = fs.statSync(filePath);
          var now = new Date().getTime();
          var endTime = new Date(fileStat.ctime).getTime() + 8640000000; // in ms (8640000000 = 100 days)
          if (now > endTime) {
            rimraf(filePath, function () {
              console.log('Cleanup: removed old entry (100 days):  ' + filePath);
            });
          }
        });
      }
    }
  });
});


