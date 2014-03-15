var fs = require('fs');

module.exports = function(app) {


  var home = require('./controllers/home');   
  app.get('/',  home.index);

  var popular = require('./controllers/popular');   
  app.get('/popular.json',  popular.index);

};
