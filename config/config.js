var path = require('path')
  , rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        root: rootPath,
        version : "0.1.dev"
    },
    production: {
        root: rootPath,
        version : "v0.1"
    }
}