var Steam = require('steam-webapi');
Steam.key = "9FBE22017BDAFE1A29251305717AB46B";
var vanityID = "Acorns";

Steam.ready(function(err) 
{
	if (err) return console.log(err);
	var steam = new Steam();
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
});

