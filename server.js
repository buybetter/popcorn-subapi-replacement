var express = require('express');

var app = express();

app.use(express.vhost('kemald.com',  require('./app.js').app));

var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});