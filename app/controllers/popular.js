var request = require('request');

exports.index = function(req, res){
	console.log(req.query);
	//TODO handle req.query.page parameter !!!
	var set = 1;
	if(req.query.page !== undefined){
		set = req.query.page
	}
	var url = "http://yts.re/api/list.json?set="+set;
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var result = JSON.parse(body);
	    var movies = [];

	    for(var i = 0; i< result.MovieList.length;i++){
	    	var resmov = result.MovieList[i];

	    	movies.push({
	    		imdb_id : resmov.ImdbCode,
	    		title : resmov.MovieTitle,
	    		year : resmov.MovieYear,
	    		runtime : 0, //TODO: fix this later
	    		synopsis : '', //TODO: fix this later
	    		vote_average : resmov.MovieRating,
	    		poster : resmov.CoverImage,
	    		backdrop : resmov.CoverImage,
	    		seeders : resmov.TorrentSeeds,
	    		leechers : resmov.TorrentPeers,
	    		videos : [{
	    			quality : resmov.Quality,
	    			url : resmov.TorrentUrl
	    		}],
	    		torrents : [{
	    			quality : resmov.Quality,
	    			url : resmov.TorrentUrl
	    		}],
	    		subtitles : []
	    	});

	    }
	    res.send(JSON.stringify({movies:movies})); 
	  }
	})

}