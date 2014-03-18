var request = require('cache-quest')({expirationTimeout: 10000});
var movieDetails = require('../models/movieDetails');
var _ = require('underscore');
var async = require('async');
var yifsub = require('../../lib/yifysubtitles');

exports.popular = function(req, res){
	console.log(req.query);
	var params = {};
	//TODO handle req.query.page parameter !!!
	var set = 1;
	if(req.query.page !== undefined){
		params['set'] = req.query.page;
	}

	var url = "http://yts.re/api/list.json";

	getMovies(url, params, function (result) {

		proccessMovieList(result,function(movies){
			res.send(JSON.stringify({movies:movies})); 
		});
	});
};

exports.search = function(req, res){
	console.log(req.query, 'searching');
	var params = {};
	//TODO handle req.query.page parameter !!!
	var set = 1;
	if(req.query.page !== undefined){
		params['set'] = set;
	}

	if(req.query.query !== undefined){
		params['keywords'] = req.query.query;
	}

	var url = "http://yts.re/api/list.json";

	getMovies(url, params, function (result) {

		proccessMovieList(result,function(movies){
			res.send(JSON.stringify({movies:movies})); 
		});
	});
};


exports.genre = function(req, res){
	console.log(req.params);
	var params = {};
	//TODO handle req.query.page parameter !!!
	var set = 1;
	if(req.query.page !== undefined){
		set = req.query.page
	}

	if(req.params[0] !== undefined){
		params['genre'] = req.params[0];
	}

	params['set'] = set;
	var url = "http://yts.re/api/list.json";

	getMovies(url, params, function (result) {

		proccessMovieList(result,function(movies){
			res.send(JSON.stringify({movies:movies})); 
		});
	});
};

function getMovies(url,params,callback,error){

	params['limit'] = 40;
	var paramList = [];
	for(var i in params){
		paramList.push(i+'='+params[i]);
	}

	url = url +'?'+ paramList.join('&');
	
	if(error === undefined){
		error = function(){
			console.log('error on loading url = ',url);		
		}
	}
	console.log('fetching url ',url);
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(JSON.parse(body));
		}else{
			error();
		}
	});
}

/*
	processes movies and returns new array
*/
function proccessMovieList(result, callback){
	var movies = [];

	if(result.MovieList === undefined){
		return callback([]);
	}

	/*
		object of movieHash's 

		movieHash['movieName']['720p'] = true;
	*/
	var movieHash = {};

	var movieTitles = {};

    for(var i = 0; i< result.MovieList.length;i++){
    	var resmov = result.MovieList[i];
    	var movieTitle = resmov.MovieTitleClean
    	movieTitles[resmov.MovieID] = resmov.MovieTitleClean;

    	if(movieHash[movieTitle] === undefined){

	    	movies.push({
	    		imdb_id : resmov.ImdbCode.split('tt').join(''),
	    		title : movieTitle,
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
	    movieHash[movieTitle] = true;
    }

    getMovieDetails(movieTitles,function(mds){
    	/*
			update subtitles list and other list using md object
    	*/
    	_.each(mds,function(md){

    		var movie = _.find(movies,function(mv){
    			if(mv.title == md.title){return true;}
    			return false;
    		});

    		movie.videos = md.torrents;
    		movie.torrents = md.torrents;
    	});

    	callback(movies);
    });

    
}

function getMovieDetails(movieTitles,callback){
	var titles = _.uniq(_.values(movieTitles));
	movieDetails.find({title : {$in : titles}},function(err, mds){
		if(err){
			console.log('erro on finding movieDetails documents');
		}

		var incomingTitles = _.pluck(mds,'title');

		var diff = _.difference(titles,incomingTitles);
		console.log('not found titles length ',diff.length);

		if(diff.length !== 0){
			var toBeUpdated = [];
			_.each(movieTitles,function(element,index){
				if(_.indexOf(diff,element) !== -1){
					toBeUpdated.push({
						id : index,
						title : element
					});
				}
			});
			populateMovieDetails(toBeUpdated);
		}
		
		callback(mds);
	});
}

/*
	Processes given movieDetails object and saves/updates respective documents
*/
function populateMovieDetails(movieTitles){

	async.eachSeries(movieTitles, function(mt,cb){
		//handle single movie mt
		var movie_id = mt.id;
		var title = mt.title;
		console.log('async called MF');
		movieDetails.findOne({title:title},function(err, doc){
			if(err){
				console.log("error on finding movieDetail from mongodb ",title);
			}
			if(doc !== null){
				console.log('movie found, continuing with update');
				continueUpdate(doc);
			}else{
				doc = new movieDetails({
					title : title,
					torrents: [],
					subtitles: []
				});
				continueUpdate(doc);
			}
		});
		

		//when called completes update operation and calls cb function
		var continueUpdate = function(md){
			var url = 'http://yts.re/api/movie.json?id='+movie_id;
			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {

					var response = JSON.parse(body)
					
					var quality = response.Quality;
					console.log('previous torrents ',md.torrents);
					console.log('new Quality ',quality);
					//check if a torrent with given quality was registered or not
					if( _.find(md.torrents,function(_tmp){ if(_tmp.quality == quality)return true; return false } ) === undefined ){
						console.log('pushing!!!');
						md.torrents.push({
							quality : quality,
							url : response.TorrentUrl
						});
					} //new torrent added

					getSubtitles(response.ImdbCode,function(subs){
						md.set('subtitles',subs);
						console.log('found subs ',subs)
						md.save(function (err, product, numberAffected) {
						  if (err){
						  	console.log('error on saving movieDetail')
						  }
						  console.log('movie with title '+title+ ' updated');
						  cb(); //finish this update operation and move to the next one
						});
					});
				}else{
					console.log('Error on fetching single movie detail ',url);
				}
			});
		}

	},function(){
		console.log('Movie detail update finished for '+movieTitles.length+' items');
	});
}

/*
	fetches subtitle links for given movie id and returnes them
*/
function getSubtitles(imdb_id,cb){
	return cb([]); //currently just return empty list
	yifsub.findSubtitle(imdb_id,cb);
}