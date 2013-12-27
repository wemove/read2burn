
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var i18n = require("i18n");

app.configure(function(){
  // default: using 'accept-language' header to guess language settings
  app.use(i18n.init);
  app.set('port', process.env.PORT || 3300);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

i18n.configure({
    locales:['en', 'de'],
    directory: __dirname + '/locales',
    defaultLocale: 'en'
});

app.get('/', routes.index);
app.post('/', routes.index);


http.createServer(app).listen(app.get('port'), 'localhost', function(){
  console.log("Express server listening on port " + app.get('port'));
});
