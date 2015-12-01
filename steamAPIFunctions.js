var Steam = require('steam-webapi');
var url = require("url");
Steam.key = "9FBE22017BDAFE1A29251305717AB46B";
var steamProfileURL = "http://steamcommunity.com/profiles/76561198085418340/";
var vanityID ="Acorns";

function parseSteamProfileURL(URL)
{
	var pathname = url.parse(steamProfileURL).pathname;
	//console.log(pathname);
	var arr = pathname.split("/");
	//console.log(arr[2]);
	return arr[2];
}

var ID = "Acorns";
//var ID = parseSteamProfileURL(steamProfileURL);
/*
function ownedGames(err, steamID)
{
	console.log("In here");
	if (err) return console.log(err);

	var steam = new Steam();

	steamID.include_appinfo = false;
	steamID.include_played_free_games = false;
	steamID.appids_filter = "";
	steam.getOwnedGames(steamID, function(err, data)
	{
		console.log("In owned games");
		for(var nds = 1; ndx < steamID.games.length; ndx ++)
		{
			console.log("AppID: " + steamID.games[ndx].appid);
			console.log("Playtime: " + steamID.games[ndx].playtime_forever + "\n");
		}
	});
}
*/

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

        //var steam = new Steam();
        data.include_appinfo = true;
        data.include_played_free_games = false;
        data.appids_filter = "";

        steam.getOwnedGames(data, function(err, data)
        {
                for(var ndx = 1; ndx < data.games.length; ndx ++)
                {
			console.log("Name: " + data.games[ndx].name);
                        console.log("AppID: " + data.games[ndx].appid);
                        console.log("Playtime: " + data.games[ndx].playtime_forever + "\n");
                }
        });
}


/*
	steam.resolveVanityURL({vanityurl: vanityID}, function (err, data)
	{
		data.include_appinfo = false;
		data.include_played_free_games = false;
		data.appids_filter = "";
		steam.getOwnedGames(data,function(err,data)
		{
			for(var ndx = 1; ndx < data.games.length; ndx ++)
			{
				console.log("Appid: " + data.games[ndx].appid);
				console.log("Playtime: " + data.games[ndx].playtime_forever + "\n");
			}
		});
	});
*/


