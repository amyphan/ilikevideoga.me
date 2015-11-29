var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var webRequest = require('request');
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'letmein',
  database : 'SteamGames'
});

dbConnection.connect();

webScrape();

function webScrape()
{
  var url = "http://store.steampowered.com/search/results?sort_by=Name&sort_order=ASC&category1=998&cc=us&v5=1&page=1";
  webRequest(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var gameList = "";
      var pageHTML = "";
      var imgList = [];
      var titles = [];
      var prices = [];
      var salePrices = [];
      $('.search_name').each(function(i, element) {
        titles[i] = {};
        titles[i].title = $(this).text().trim();
      });

      $('.search_released').each(function(i, element){
        titles[i].released = $(this).text().trim();
      });

      $('.search_capsule').each(function(i, element){
        imgList[i] = $(this).html();
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
          prices[i] = $(this).text().trim();
          salePrices[i] = prices[i];
        }
      });

    }
    //replace any page templating things with a new database insertion here

    for(i = 1; i < titles.length; i++)
    {
      var sql = 'INSERT IGNORE INTO GamesList (Id, Name, Price, SalePrice, Image) VALUES (';
      
      var values = '1,"' + titles[i].title.trim() + '","' + prices[i].trim() + '","'+ salePrices[i].trim() + '",\'' + imgList[i] + "\')";
      sql = sql + values;
      //Create an update string just in case the entry already exists
      var updateString = 'ON DUPLICATE KEY UPDATE ' + 'Price="' + prices[i].trim() + '", SalePrice="' + salePrices[i].trim() + '", Image=\'' + imgList[i] +"\';" ;
      sql = sql + updateString;
      console.log(sql);
      dbConnection.query(sql, function(err) {
        if(err) {
          console.log('FUuuuuuuuuuuuuuuuuck');
          console.log(err);
          process.exit(0); 
        }
        console.log("Entry successfully Added!");
      });
    }

    dbConnection.end();
  console.log("Check the console!");
});
}
