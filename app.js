/**
 * Module dependencies.
 */
const express = require('express')
    , http = require('http')
    , path = require('path')
    , Umzug = require('umzug')
    , bodyParser = require('body-parser')
    , cron = require('node-cron')
    , Datastore = require('@seald-io/nedb')
    , routes = require('./routes')
    , i18n = require("i18n");
;

const app = express();
const umzug = new Umzug();
const DEFAULT_MAX_SECRET_CHARS = 4000;
const URLENCODED_BYTES_PER_CHAR = 12;
const URLENCODED_FORM_OVERHEAD_BYTES = 8192;

const envMaxSecretChars = Number.parseInt(process.env.READ2BURN_MAX_SECRET_CHARS || '', 10);
const maxSecretChars = Number.isInteger(envMaxSecretChars) && envMaxSecretChars > 0
    ? envMaxSecretChars
    : DEFAULT_MAX_SECRET_CHARS;
const envPublicBaseUrl = (process.env.READ2BURN_PUBLIC_URL || '').trim();
let publicBaseUrl = '';
if (envPublicBaseUrl) {
    let parsedPublicBaseUrl;
    try {
        parsedPublicBaseUrl = new URL(envPublicBaseUrl);
    } catch (err) {
        throw new Error('READ2BURN_PUBLIC_URL must be a valid absolute URL.');
    }
    if (parsedPublicBaseUrl.protocol !== 'http:' && parsedPublicBaseUrl.protocol !== 'https:') {
        throw new Error('READ2BURN_PUBLIC_URL must use http or https.');
    }
    // Keep optional base path to support context-path deployments.
    if (!parsedPublicBaseUrl.pathname || parsedPublicBaseUrl.pathname === '') {
        parsedPublicBaseUrl.pathname = '/';
    } else if (!parsedPublicBaseUrl.pathname.endsWith('/')) {
        parsedPublicBaseUrl.pathname = `${parsedPublicBaseUrl.pathname}/`;
    }
    parsedPublicBaseUrl.search = '';
    parsedPublicBaseUrl.hash = '';
    publicBaseUrl = parsedPublicBaseUrl.toString();
}
const maxSecretCharsWarning = Math.max(1, maxSecretChars - Math.max(10, Math.floor(maxSecretChars * 0.01)));
const maxRequestBodyBytes = (maxSecretChars * URLENCODED_BYTES_PER_CHAR) + URLENCODED_FORM_OVERHEAD_BYTES;

// default: using 'accept-language' header to guess language settings
app.use(i18n.init);
app.set('port', process.env.PORT || 3300);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.locals.maxSecretChars = maxSecretChars;
app.locals.maxSecretCharsWarning = maxSecretCharsWarning;
app.use(express.Router());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false, limit: `${maxRequestBodyBytes}b` }));
app.enable('trust proxy');
app.disable( 'x-powered-by' )

const dbFile = process.env.READ2BURN_DB_FILE || 'data/read2burn.db';
const nedb = new Datastore({filename: dbFile, autoload: true});
nedb.ensureIndex({ fieldName: 'key', unique: true }, function (err) {
    if (err) {
        console.error('Failed to ensure unique index on key field.', err);
    }
});
exports.nedb = nedb
exports.maxSecretChars = maxSecretChars;
exports.publicBaseUrl = publicBaseUrl;


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

// start server
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

// schedule regular cleanup
cron.schedule('12 1 * * *', function () {
    console.log("Cleanup proceeding...")
    const expireTime = new Date().getTime() - 8640000000;
    nedb.remove({timestamp: {$lte: expireTime}}, { multi: true }, function(err, numDeleted) {
        console.log('Deleted', numDeleted, 'entries');
        nedb.persistence.compactDatafile();
    });
});


