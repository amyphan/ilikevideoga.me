var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var webRequest = require('request');

webScrape();

function webScrape()
{
  console.log("HELP HELP HELP");
  var url = "http://store.steampowered.com/search/results?sort_by=Name&sort_order=ASC&category1=998&cc=us&v5=1&page=1";
  webRequest(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      var gameList = "";
      var pageHTML = "";
      var imgList = [];
      var titles = [];
      var prices = [];
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
        prices[i] = $(this).html();
      });

    }
    pageHTML = '<head>\n</head>\n</body>\n   <div>';

      for(i = 0; i < titles.length; i++)
      {
        pageHTML += imgList[i] + '\n';
        pageHTML += "<p>" + titles[i].title + ": " + titles[i].released + '\n';
        pageHTML += prices[i] + '</p>\n';
      }
    pageHTML += '\n</div>\n    </body>';

      fs.writeFile('scrape.html', pageHTML, function(err){
        console.log("File successfully written to output.txt");
      })
    });
  console.log("Check the console!");
}
