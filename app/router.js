var fs = require('fs');

module.exports = function(app) {


  var home = require('./controllers/home');   
  app.get('/',  home.index);

  var list = require('./controllers/list');   
  app.get('/popular.json',  list.popular);
  app.get('/search.json',  list.search);
  app.get(/^\/(.*)?\.json$/, list.genre);

};
