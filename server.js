//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var webRequest = require('request');

//Lets define a port we want to listen to
const PORT=80;
     
//Create a server
var server = http.createServer(function(request, response) {
    var file      = path.basename(request.url) || 'index.html';
    console.log(request.url);  
    fs.exists(file, function(exists) {
        if(exists) {
            fs.readFile(file, function(err, data) {
                if(!err){
                    webScrape();
                    response.end(data);
                } else {
                    console.dir(err);
                }
            });
        } else {
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end("404 page not found");
        }
    });
});
    
//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

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

    }
    pageHTML = '<head>\n</head>\n</body>\n   <div>';

      for(i = 0; i < titles.length; i++)
      {
        pageHTML += imgList[i] + '\n';
        pageHTML += "<p>" + titles[i].title + ": " + titles[i].released + '</p>\n';
      }
    pageHTML += '\n</div>\n    </body>';

      fs.writeFile('scrape.html', pageHTML, function(err){
        console.log("File successfully written to output.txt");
      })
    });
  console.log("Check the console!");
}
