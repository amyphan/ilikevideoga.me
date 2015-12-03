var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var webRequest = require('request');
var mysql = require('mysql');
//EVENT EMITTER
var events = require('events');
var eventEmitter = new events.EventEmitter();
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
});

var baseURL = "http://store.steampowered.com/search/results?sort_by=Name&sort_order=ASC&category1=998&cc=us&v5=1&page=";

dbConnection.connect();
getTotalPages(baseURL);

/* queryCheck just here to demonstrate programming patterns */
var queryCheck = function(){
    console.log('Query Processed');
}
eventEmitter.on('queryDone', queryCheck);

getTotalPages(baseURL);

function webScrape(totalPages)
{
  var url = baseURL;
  //get total number of pages and begin scraping
  for(pageNumber = 1; pageNumber <= totalPages; pageNumber++)
  {
    var pageURL = baseURL.concat(pageNumber);
    console.log(pageURL);
    webRequest(pageURL, function(error, response, html) {
      if(error) {
        console.log(error);
        process.exit(0);
      }
      $ = cheerio.load(html);
      var gameList = "";
      var pageHTML = "";
      var imgList = [];
      var titles = [];
      var prices = [];
      var salePrices = [];
      $('.search_name').each(function(i, element) {
        titles[i] = {};
        titles[i].title = $(this).text().trim().replace(/\"/g, "\'");
      });

      $('.search_released').each(function(i, element){
        titles[i].released = $(this).text().trim();
      });

      $('.search_capsule').each(function(i, element){
        imgList[i] = $(this).html();
        titles[i].ID = $(this).html().split('/')[5];
      });

      $('.search_price.responsive_secondrow').each(function(i, element) {
        var priceText = $(this).text();
        if($(this).children().text() != "") {
          //checks to see if there was a sale
          //get regular price
          prices[i] = $(this).children().text();
          salePrices[i] = $(this).text().replace(prices[i], "").trim();
        }
        else {
          //set sale price equal to regular price because no discount
          prices[i] = $(this).text().trim().replace("\$", "");
          salePrices[i] = prices[i];
        }
      });
      //Begin database entries here

      for(i = 0; i < titles.length; i++)
      {
        var sql = 'INSERT IGNORE INTO GamesList (Id, Name, Price, SalePrice, Image) VALUES (';
      
        var values = titles[i].ID + ",\"" + titles[i].title.trim().replace(/\'/g,"\'\'") + "\",\"" + prices[i].trim() + '","'+ salePrices[i].trim() + '",\'' + imgList[i] + "\')";
        sql = sql + values;
        //Create an update string just in case the entry already exists
        var updateString = 'ON DUPLICATE KEY UPDATE '+'Price="' + prices[i].trim() + '", SalePrice="' + salePrices[i].trim() + '", Image=\'' + imgList[i] +"\';" ;
        sql = sql + updateString;
        console.log(sql);
        dbConnection.query(sql, function(err) {
          if(err) {
            console.log('FUuuuuuuuuuuuuuuuuck');
            console.log(pageNumber);
            //console.log(titles[i].title.trim().replace("'", "''"));
            console.log(err);
            if(titles[i] && imgList[i]){
              console.log(titles[i].title.trim());
              console.log(imgList[i]);
              console.log(err);
            }
            process.exit(0);
          }
          if(pageNumber === totalPages && i == titles.length -1){
            console.log("Quitting queries!");
          }
        });
      }
    });
  }
}

function getTotalPages(baseURL)
{
  webRequest(baseURL, function(error, response, html) {
    if(error){
      console.log(error);
      process.exit(0);
    }

    var $ = cheerio.load(html);
    var pageIndexes = [];
    $('.search_pagination_right').children().each(function(i, element) {
      pageIndexes[i] = $(this).text();
    });
    var totalPages = pageIndexes[pageIndexes.length - 2];
    console.log("total pages: " + pageIndexes[pageIndexes.length - 2]);
    return webScrape(totalPages);
  });
} 
