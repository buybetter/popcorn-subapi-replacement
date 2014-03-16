var express = require('express'),
	server = express();

var app = require('./app.js').app;

var port = 8080;

server.use(express.vhost('*',  app));

var ret = server.listen(port, function() {
	console.log('Listening on port %d nodejitsu', ret.address().port); 
}); 	
