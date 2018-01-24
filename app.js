
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , Umzug = require('umzug');

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

i18n.configure({
    locales:['en', 'de'],
    directory: __dirname + '/locales',
    defaultLocale: 'en'
});

app.get('/', routes.index);
app.post('/', routes.index);

console.log( "umzug:" + umzug.storage )

umzug.up().then(function (migrations) {
  // "migrations" will be an Array with the names of the
  // executed migrations.
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


