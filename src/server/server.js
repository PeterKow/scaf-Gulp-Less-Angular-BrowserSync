var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compress = require('compression');
var cors = require('cors');

var port = process.env.PORT || 4000;
var environment = process.env.NODE_ENV;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(compress());
app.use(cors());

app.use(express.static('./public/'));
app.use(express.static('./build/'));
app.use(express.static('./bower_components/'));
app.use(express.static('./tmp/'));
app.use(express.static('./'));

// switch (environment) {
//     case 'build':
//         console.log('** BUILD **');
//         app.use(express.static('./build/'));
//         // Any invalid calls for templateUrls are under app/* and should return 404
//         app.use('/app/*', function(req, res, next) {
//             four0four.send404(req, res);
//         });
//         // Any deep link calls should return index.html
//         app.use('/*', express.static('./build/index.html'));
//         break;
//     default:
//         console.log('** DEV **');
//         app.use(express.static('./src/client/'));
//         app.use(express.static('./'));
//         app.use(express.static('./tmp'));
//         // All the assets are served at this point.
//         // Any invalid calls for templateUrls are under app/* and should return 404
//         app.use('/app/*', function(req, res, next) {
//             four0four.send404(req, res);
//         });
//         // Any deep link calls should return index.html
//         app.use('/*', express.static('./src/client/index.html'));
//         break;
// }


// app.use('/*', express.static('./'));

var server = app.listen(port, function() {
    console.log('Server started at port ', server.address().port);
});