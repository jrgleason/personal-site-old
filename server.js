
/**
 * Module dependencies.
 */

var connect_cache = require('connect-cache');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var connect_cache = require('connect-cache');

if (typeof ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
  console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
  ipaddress = "0.0.0.1";
};

var app = express();
self.app = app;

// all environments
app.set('port', port);
self.port = port;
self.ipaddress = ipaddress;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(connect_cache({rules: [{regex: /.*/, ttl: 60000}]}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/java', routes.java);
app.get('/responsive', routes.responsive);
app.get('/android', routes.android);
app.get('/viz', routes.viz);
app.get('/users', user.list);

http.createServer(app).listen(port, ipaddress, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
