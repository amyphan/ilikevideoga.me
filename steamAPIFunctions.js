var Steam = require('steam-webapi');
var url = require("url");
Steam.key = "9FBE22017BDAFE1A29251305717AB46B";
var steamProfileURL = "http://steamcommunity.com/profiles/76561198085418340/";
var vanityID ="Acorns";
var sql1,sql2,sql3;
var mysql = require('mysql');

var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
});
function parseSteamProfileURL(URL)
{
	var pathname = url.parse(steamProfileURL).pathname;
	var arr = pathname.split("/");
	return arr[2];
}

var ID = "Acorns";
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
      
      sql1 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID1 + "LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID1 + " LIMIT 1),'%') LIMIT 10;";
      sql2 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID2 + "LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID2 + " LIMIT 1),'%') LIMIT 10;";
      sql3 = "SELECT DISTINCT game.Id, game.Name, game.Tags FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID3 + "LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = " + appID3 + " LIMIT 1),'%') LIMIT 10;";
    }
	});
}

