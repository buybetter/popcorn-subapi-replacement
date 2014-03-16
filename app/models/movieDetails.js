var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var movieDetailsSchema = new Schema({
	title : {type:String},
  	torrents : [{
  		url : String,
  		quality : String
  	}],
  	subtitles : [{
  		language : String,
  		url : String
  	}]
});

module.exports=  mongoose.model('movieDetails', movieDetailsSchema);