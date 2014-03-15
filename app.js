
var express = require('express')
    , swig = require('swig')
    , fs = require('fs')
    , app = express();
    

var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env];


app.configure(function(){
    // GZip responses
    app.use(express.compress());
    //to handle POST parameters
    app.use(express.bodyParser());
    //to handle cookies
    app.use(express.cookieParser('subapi-secret'));
    //to manage session mongoDB
    app.use(express.session({ 
            secret: 'super-subapi-secret' 
        })
    );
    //to enable put and delete
    app.use(express.methodOverride());
    //static files
    app.use(express.static(__dirname + '/www'));
    //error pages 
    app.use(express.errorHandler({dumpExceptions: true, showStack: true})); // Dump errors

    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/app/views');
    app.set('view cache', env !== 'development');
    

    //globals for views
    app.use(function(req, res, next) {
        res.locals = {
            path : req.path.split("/")[1]
            , host : req.host
            , environment : env
        };
        next();
    });
    app.use(app.router);
});
require('./app/router')(app);

exports.app = app