var fs = require('fs');
var handlebars = require('handlebars');
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
  });

dbConnection.connect();



var gameList = { "gameItem" : [ { "gameImg"   : "./woops.jpg",
                   "gameTitle" : "Bad Rats",
                   "gamePrice" : "$0.99" } ,
                 { "gameImg"   : "./woops.jpg",
                   "gameTitle" : "Gunpoint",
                   "gamePrice" : "$9.99"  } ] };

fs.readFile("./templates/pContainer.html.handlebars", 'utf-8', function(err, data) {
  if(err) {
    console.log("BOOOOOOOOOOM");
    exit(0);
  }
  var queryResults;
  var sql = 'SELECT * FROM `GamesList` WHERE `Id` != 1';
  dbConnection.query(sql, function(error, results, fields) {
    queryResults = { "gameItem" : results };
    var template = handlebars.compile(data);
    var pContainers = template(queryResults);
    fs.readFile("./templates/s.html.handlebars", 'utf-8', function(err, data) {
      if(err) {
        console.log("BOOOOOOOOOOM");
        exit(0);
      }

      var gamez = { "gameList" : pContainers };

      var sTemplate = handlebars.compile(data);

      fs.writeFile("s.html", sTemplate(gamez), 'utf-8', function(err) {
        if(err){
          console.log("BOOOOOOOM");
          exit(0);
        }
        console.log("Full s.html page generated!");
        dbConnection.end();
      });
    });
  });
});
