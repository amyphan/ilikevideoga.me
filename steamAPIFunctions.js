var async = require('async');
var fs = require('fs');
var handlebars = require('handlebars')
var Steam = require('steam-webapi');
var url = require("url");
Steam.key = "9FBE22017BDAFE1A29251305717AB46B";
//var steamProfileURL = "http://steamcommunity.com/profiles/76561198085418340/";
var steamProfileURL = "http://steamcommunity.com/profiles/76561198030289343";
var sql1,sql2,sql3;
var mysql = require('mysql');

var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
});
dbConnection.connect();

function parseSteamProfileURL(URL)
{
	var arr = URL.split("/");
	return arr[4];
}
//console.log(steamProfileURL.split("/").length);
var ID = "Nameki";
//var urlID = parseSteamProfileURL(steamProfileURL);

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
		console.log("Vanity ID " + ID);
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
                  
			//console.log("Name: " + data.games[ndx].name);
      //console.log("AppID: " + data.games[ndx].appid);
      //console.log("Playtime: " + data.games[ndx].playtime_forever + "\n");
    }
    console.log(appID1 + "," + appID2 + "," + appID3);
    var discountSQL = "SELECT * FROM GamesList WHERE SalePrice > 5 AND SalePrice < 30 ORDER BY RAND() LIMIT 30;";
    var sql1 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.Price > 5 AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " + appID1 + " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID1+" LIMIT 1),'%') ORDER BY RAND() LIMIT 10;";

    var sql2 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.Price > 5 AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " +appID2+ " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID2+" LIMIT 1),'%') ORDER BY RAND() LIMIT 10;";

    var sql3 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.Price > 5 AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = " +appID3+ " LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID3+" LIMIT 1),'%') ORDER BY RAND() LIMIT 10;";

    //var sql2 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = "+appID2+" LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID2+" LIMIT 1),'%' ) ORDER BY RAND() LIMIT 10;";
    //var sql3 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = "+appID3+" LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID3+" LIMIT 1),'%' ) ORDER BY RAND() LIMIT 10;";

    var queryResults = {};
    var salesHTML;
    var gameQueue;
    var gamesList;
    //do all db queries first and then template one by one
    //Get top discount first, then each sql query
    dbConnection.query(discountSQL, function(err, saleResults, saleFields) {
      if(err){
        console.log(err);
        process.exit(0);  
      }
      queryResults.gameItem = saleResults;
      dbConnection.query(sql1, function(err, results1, fields1) {
        if(err){
          console.log(err);
          process.exit(0);
        }
        gamesList = results1;
        dbConnection.query(sql2, function(err, results2, fields2) {
          if(err){
            console.log(err);
            process.exit(0);
          }
          gamesList = gamesList.concat(results2);
          dbConnection.query(sql3, function(err, results3, fields3) {
            if(err){
              console.log(err);
              process.exit(0);
            }
            gamesList = gamesList.concat(results3);
            queryResults.gameQueueItem = gamesList;
            fs.readFile("./templates/pContainer.html.handlebars",'utf-8',function(err, data) {
              var template = handlebars.compile(data);
              salesHTML = template(queryResults);

              fs.readFile("./templates/userQueue.html.handlebars",'utf-8',function(err, data) {
                var template = handlebars.compile(data);
                gameQueue = template(queryResults);
              
                fs.readFile("./templates/s.html.handlebars",'utf-8',function(err, data) {
                  var template = handlebars.compile(data);
                  var pageContext = { "gameList" : salesHTML,
                                      "gameQueue": gameQueue };

                  fs.writeFile("s.html", template(pageContext), 'utf-8', function(err) {
                    if(err){
                      console.log(err);
                      process.exit();
                    }
                    console.log("Page Templated to s.html!");
                    dbConnection.end();
                  });
                });
              });
            });
          });
        });
      });
    });    
  });
}
