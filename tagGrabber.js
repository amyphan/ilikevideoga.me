var async = require('async');
var cheerio = require('cheerio');
var webRequest = require('request');
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host       : 'localhost',
  user       : 'root',
  password   : 'letmein',
  database   : 'SteamGames'
});

/*
  DO NOT RUN THIS CODE OR TOUCH IT UNLESS YOU PLAN TO FIX IT.
  
  Right now our EC2 micro server can't really handle more than 300 queries at a time
  So I had to populate the mysql database by running this a bunch of times in a row
  incrementing the indices manually each time. 

  Either we need to do another async.eachSeries call for each set of entries
  or just get a more powerful server. Node seems to run out of memory with 
  queries using more than 300 titles as far as we know.
*/

dbConnection.connect();

var baseURL = "http://store.steampowered.com/app/";
var url;

var appIDs = [];
var sql = 'SELECT * FROM `GamesList` WHERE `Id` != 1';

getGames(sql);

function getGames(sql){
  dbConnection.query(sql, function(error, results, fields){
    if(error) {
      console.log(error);
      process.exit(0);
    }
    //Fill appID array for list of games we need to search through for tags
    for(var i = 7000; i < 7058; i++)
    {
      appIDs[i-7000] = results[i].Id;
    }
    
    //Go to each game's store page and scrape the tags. Add them to their
    //database entry

    async.each(appIDs, tagScraping, function(err){
      if(err){
        console.log(err);
        process.exit(0);
      }
      console.log("A callback finished!");
      dbConnection.end();
    }); 
  });
}

var tagScraping = function(appID, callback){
    url = baseURL.concat(appID);
    //console.log(url);
    webRequest(url, function(err, response, html){
      if(err){
        console.log(err);
        process.exit(0);
      }

      var $ = cheerio.load(html);
      var tagList = [];

      $('.popular_tags > a').each(function(i, element){
        tagList[i] = $(this).text().trim();
        //console.log(tagList[i]);
      });
      //console.log(tagList);
      console.log(appID);
      var sqlEntry = 'UPDATE GamesList SET Tags=\"' + tagList.toString() + "\"";;
      sqlEntry = sqlEntry + " WHERE Id =" + appID + ";";
      //console.log(sqlEntry);
      dbConnection.query(sqlEntry, function(err) {
        if(err) {
          console.log(err);
          process.exit(1);
        }
        else{
          //console.log("Entry Success!");
          return callback();
        }
      }); 
    });
};
