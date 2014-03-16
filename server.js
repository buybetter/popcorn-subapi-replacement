var express = require('express');

var app = express();
app.use(express.vhost('kemald.com',  require('./app.js').app));
app.use(express.vhost('supapi-kemald.rhcloud.com',  require('./app.js').app));

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
console.log(ipaddress);
var server = app.listen(port,ipaddress, function() {
    console.log('Listening on port %d', server.address().port); 
}); 