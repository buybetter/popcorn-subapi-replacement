var express = require('express'),
	server = express();

var app = require('./app.js').app;

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

server.use(express.vhost('*',  app));

if(process.env.OPENSHIFT_NODEJS_IP === undefined){
	var ret = server.listen(port, function() {
    	console.log('Listening on port %d a', ret.address().port); 
	}); 	
}else{
	var ret = server.listen(port, process.env.OPENSHIFT_NODEJS_IP, function() {
    	console.log('Listening on port %d nodejitsu', ret.address().port); 
	}); 
} 
