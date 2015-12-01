var async = require('async');
var fs = require('fs');
var handlebars = require('handlebars')
var Steam = require('steam-webapi');
var url = require("url");
Steam.key = "9FBE22017BDAFE1A29251305717AB46B";
//var steamProfileURL = "http://steamcommunity.com/profiles/76561198085418340/";
//var vanityID ="Acorns";
var steamProfileURL = "http://steamcommunity.com/profiles/76561198030289343";
var vanityID ="Akimbo Chicken Strips";
var sql1,sql2,sql3;
var mysql = require('mysql');

var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
});


var getGames = function(sql, callback){
  dbConnection.query(sql, function(err, results, fields){
    if(err){
      console.log(err);
      process.exit(0);
    }
    callback(results);
  });
};

function parseSteamProfileURL(URL)
{
	var pathname = url.parse(steamProfileURL).pathname;
	var arr = pathname.split("/");
	return arr[2];
}

var ID = "LostSoulforLegit";
//var ID = parseSteamProfileURL(steamProfileURL);


Steam.ready(function(err) 
{
	if (err) return console.log(err);
	var steam = new Steam();
	
	var isNum = /^\d+$/.test(ID);
	if(isNum)
	{
		steam.steamid = ID;
		
		console.log(steam.steamid);
		ownedGames(err, steam);
	}
	else
	{
		console.log("Vanity ID");
		steam.resolveVanityURL({vanityurl: ID}, function (err, data)
		{
			ownedGames(err, data);
		});
	}
});


function ownedGames(err, data)
{
	var steam = new Steam();
	var steamID = data.steamid;
  console.log("In here");
	if (err) return console.log(err);
  
	data.include_appinfo = true;
	data.include_played_free_games = false;
	data.appids_filter = "";

	steam.getOwnedGames(data, function(err, data)
	{
    var game1 = 0, game2 = 0, game3 = 0;
    var appID1 = 0, appID2 = 0, appID3 = 0;
    for(var ndx = 0; ndx < data.games.length; ndx ++)
    {
      if(data.games[ndx].playtime_forever>game3){
        if(data.games[ndx].playtime_forever>=game2){
           //3 = 2 
          game3 = game2;
          appID3 = appID2;
          if(data.games[ndx].playtime_forever>=game1){
            game2 = game1;
            appID2 = appID1;
            game1 = data.games[ndx].playtime_forever;
            appID1 = data.games[ndx].appid;
          }else{
            game2 = data.games[ndx].playtime_forever;
            appID2 = data.games[ndx].appid;
          }
        }else{            
          game3 = data.games[ndx].playtime_forever;
        	appID3 = data.games[ndx].appid;
        }
      }
                  
			console.log("Name: " + data.games[ndx].name);
      console.log("AppID: " + data.games[ndx].appid);
      console.log("Playtime: " + data.games[ndx].playtime_forever + "\n");
    }
    console.log(appID1 + "," + appID2 + "," + appID3);
      var discountSQL = 'SELECT * FROM `GamesList` WHERE (1-SalePrice/Price)*100>30 ORDER BY SalePrice ASC LIMIT 50;';
      sql1 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID1 + " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID1 + " LIMIT 1),'%') LIMIT 10;" 
      sql2 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID2 + " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID2 + " LIMIT 1),'%') LIMIT 10;" 
      sql3 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID3 + " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID3 + " LIMIT 1),'%') LIMIT 10;"

  console.log(sql1);
  console.log(sql2);
  console.log(sql3);

  });
}
