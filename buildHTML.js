var fs = require('fs');
var handlebars = require('handlebars');
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
  });

var appID1 = 4000;
var appID2 = 322170;
var appID3 = 105600;

dbConnection.connect();
var discountSQL = "SELECT * FROM GamesList WHERE SalePrice != Price ORDER BY salePrice ASC LIMIT 20;";
var sql1 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = "+appID1+" LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID1+" LIMIT 1),'%' ) ORDER BY RAND() LIMIT 10;";
var sql2 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = "+appID2+" LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID2+" LIMIT 1),'%' ) ORDER BY RAND() LIMIT 10;";
var sql3 = "SELECT DISTINCT game.Id, game.Name, game.Tags, game.Price, game.SalePrice, game.Image FROM GamesList as game WHERE game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',1) FROM GamesList WHERE Id = "+appID3+" LIMIT 1),'%') AND game.tags LIKE CONCAT('%',(SELECT DISTINCT SUBSTRING_INDEX(tags,',',-1) FROM GamesList WHERE Id = "+appID3+" LIMIT 1),'%' ) ORDER BY RAND() LIMIT 10;";

var queryResults = {};
var salesHTML;
var gameQueue;
var gamesList;
fs.readFile("./templates/pContainer.html.handlebars", 'utf-8', function(err, data) {
  if(err) {
    console.log(err);
    process.exit(0);
  }
  
  dbConnection.query(discountSQL, function(error, results, fields) {
    queryResults.gameItem = results;
    var template = handlebars.compile(data);
    salesHTML = template(queryResults);
    dbConnection.query(sql1, function(error, results1, fields1) {
      if(error){
        console.log(error);
        process.exit(0);
      }
      gamesList = results1;
      dbConnection.query(sql2, function(error, results2, fields2) {
        if(error){
          console.log(error);
          process.exit(0);
        }
        gamesList.concat(results2);
        dbConnection.query(sql3, function(error, results3, fields3) {
          if(error){
            console.log(error);
            process.exit(0);
          }
          gamesList.concat(results3);
          queryResults.gameQueueItem = gamesList;
          fs.readFile("./templates/userQueue.html.handlebars", 'utf-8', function(err,data) {
            if(err){
              console.log(err);
              process.exit(0);
            }
            var template = handlebars.compile(data);
            gameQueue = template(queryResults);
            fs.readFile("./templates/s.html.handlebars", 'utf-8', function(err,data) {
              if(err){
                console.log(err);
                process.exit(0);
              }
              var template = handlebars.compile(data)
              var pageContext = { "gameList" : salesHTML,
                                  "gameQueue": gameQueue };

              fs.writeFile("s.html", template(pageContext), 'utf-8', function(err,data){
                if(err){
                  console.log(err);
                  process.exit();
                }
                console.log("s.html has been compiled!");
                dbConnection.end();
              });
            });
          });
        });
      });
    });
  });
});
