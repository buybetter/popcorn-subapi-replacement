var request = require('request');

exports.index = function(req, res){
	console.log(req.query);
	res.send('It is working', 200);
	var url = "http://yts.re/api/list.json";
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body) // Print the google web page.
	    var result = JSON.parse(body);
	    var movies = [];

	    for(var i = 0; i< result.MovieList.length;i++){
	    	var resmov = result.MovieList[i];

	    	movies.push({
	    		imdb_id : resmov.ImdbCode,
	    		title : resmov.MovieTitle,
	    		year : resmov.MovieYear,
	    		runtime : 0,
	    		synopsis : '' //TODO: fix this later
	    		vote_average : resmov.MovieRating,
	    		poster : resmov.CoverImage,
	    		backdrop : resmov.CoverImage,
	    		seeders : resmov.TorrentSeeds,
	    		leechers : resmov.TorrentPeers,
	    		movies : [{
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