
//libraries
const mqtt = require('mqtt');
const mysql = require('mysql');
const express = require('express');
const config = require('../config/nodeJSAuth.json');
var request = require('request'),
	fs = require('fs');

//mqtt client
const mqttClient = mqtt.connect(config.mqtt.host);

//shadow wall mqtt connecties
const optionsShadowall = {username:config.shadowwall.auth.username, password: config.shadowwall.auth.password};
const mqttShadowall = mqtt.connect(config.shadowwall.host, optionsShadowall);
const mqttShadowallPub = config.shadowwall.pub;

//de pub en sub kanalen voor de mqtt server
const mqttPub = config.mqtt.pub;
const mqttSub = config.mqtt.sub;

//API settings
const app = express();
app.use(express.json());
const port = config.api.apiPort;

//Discord
const Discord = require('discord.js');
const discordAuth = require('./discordStuff/auth.json');
let bot = new Discord.Client();
const prefix = "+";

//alle ID van kanalen, rollen etc.
const guildID = "582908434857328641";
const userRoleID = "582928958157225985";
const rulesChannelID = "582920894951718912";
const logsChannelID = "582932458815619073";
const memesChannelID = "582932036730486784";
const topChannelID = "582990476693733406";
const topMessageID = "582990623397642240";
const stirMededelingenID = "585404340504887306";
const stirAdminID = "585403731978223617";
const judgeChannelID = "582997289778413588";
const councilRoleID = "582996898386804847";
const headRoleID = "582912928047693824";

//emoticons die worden gebruikt
const thumbsUp = '👍';
const thumbsDown = '👎';
const checkMark = '✅';
const cross = '❎';

//alle kanalen
let memesChannel;
let logsChannel;
let topChannel;
let judgeChannel;
let topMemePost;
let stirMededelingen;

bot.login(discordAuth.token);

let loggedIn = false;
let accountID = -1;
let timerFunction;
let requestAPI;

let con = mysql.createConnection(
	{
		host: config.mysql.host,
		user: config.mysql.user,
		password: config.mysql.pass,
		database: config.mysql.database
	});


//connect met de database
con.connect(function (error) {
	if (error) throw error;
	console.log("Connected to database");
});
//connect met de mqtt client
mqttClient.on('connect', function () {
	mqttClient.subscribe(mqttSub);
	mqttClient.publish(mqttPub, 'Online');
});

/* #region Discord */

/*dit stuk van de code zorgt voor het setten van alle kanaal variabelen 
en update alle punten en de topPost.
Dit gebeurt als de bot wordt opgestart
*/
bot.on("ready", () => {
	console.log("bot is online");
	bot.user.setPresence({ status: 'online', game: { name: 'begin commands with +' } });
	logsChannel = bot.guilds.get(guildID).channels.get(logsChannelID);
	memesChannel = bot.guilds.get(guildID).channels.get(memesChannelID);
	topChannel = bot.guilds.get(guildID).channels.get(topChannelID);
	stirMededelingen = bot.guilds.get(guildID).channels.get(stirMededelingenID);
	setInterval(async function () {
		await updatePoints();
		checkTopMeme();
	}, 60000);
	updatePoints();
	checkTopMeme();
	console.log("done");
	judgeChannel = bot.guilds.get(guildID).channels.get(judgeChannelID);
});

//als er een bericht wordt gepost
bot.on("message", async message => {
	if (message.author.bot) return;

	/*als het bericht van de rules channel komt, zal hij kijken of het +accept is en dan die
	persoon de juiste rol geven*/
	if (message.channel.id == rulesChannelID) {
		console.log(message.content);
		if (!message.member.roles.has(headRoleID)) message.delete().catch();
		if (message.content == "+accept") {
			if (!message.member.roles.has(userRoleID)) {
				message.member.addRole(userRoleID);
				message.member.send("Welcome!\nBe sure to read the info channels to familiarize yourself with the commands and how they work!");
			}
		}
		return;
	}
	let args = message.content.slice(prefix.length).trim().split(/ +/g);
	let command = args.shift().toLowerCase();

	//delete hoeveelheid berichten
	if(command == "purge")
	{
		console.log("delete");
				if (message.member.hasPermission("ADMINISTRATOR")) {
					message.channel.bulkDelete(parseInt(args[0]));
				}
				postLog(message, "command", command + " " + args.join(' '));
				return;
	}
	if(message.channel.id == stirMededelingenID)
	{
		console.log("STIR",message.content);
		return;
	}

	//zoekt de meme met de doorgegeven titel en post het in het kanaal waar het search request vandaan kwam
	if (message.content.indexOf("search:#") != -1) {
		let searchText = message.content.slice(message.content.indexOf("search:#"));
		searchText = searchText.slice(searchText.indexOf("#"));
		if (searchText.indexOf("#") == 0 && searchText.lastIndexOf("#") == searchText.length - 1 && searchText.lastIndexOf("#") != 0) {
			searchText = searchText.slice(1, -1).toUpperCase();
			console.log(searchText);
			let sql = "select url from memes where upper(title) = ?";
			let insert = [searchText];
			sql = mysql.format(sql, insert);
			con.query(sql, function (err, results) {
				if (err) throw err;
				if (results[0] != null) {
					message.channel.send({ files: [results[0].url] });
					return;
				}
				else {
					return;
				}
			});
		}
	}
	if (message.content.indexOf(prefix) != 0) return;

	//alle commands die in een guild kunnen worden gebruikt
	if (message.guild != null) {
		message.delete().catch();
		switch (command) {

			//ping command
			case "ping":
				postLog(message, "command", command);
				message.channel.send("Ping?").then(m => {
					m.edit("Pong! latency is " + (m.createdTimestamp - message.createdTimestamp) + "ms\nAPI latency is " + Math.round(bot.ping) + "ms");
				});
				break;
			//zegt tegen de author hoe hij memes moet uploaden
			case "start":
				postLog(message, "command", command);
				message.author.send("To upload a meme, type `+upload (title) <url>`.\nIf you want to attach an image to upload, leave <url> empty.\nYou can also, instead of an attachment, use an url. Make sure the url starts with http(s):// and that it links to the image.\n\nMake sure to have read the Rules!.");
				break;
			//fail upload message
			case "upload":
				message.author.send("You have to run upload from DMs");
				break;
			//refresht de top meme
			case "refreshtop":
				if (message.member.hasPermission("ADMINISTRATOR")) {
					await updatePoints();
					checkTopMeme();
				}
				break;
			//verwijdert een meme van de lijst van memes en geeft de reden door aan de author
			case "removememe":
				if (message.member.roles.has(headRoleID)) {
					postLog(message, "command", command + " " + args.join(' '));
					if (args.length >= 2) {
						let sql = "select memberID, messageID, title from memes where ID = ?";
						let insert = [args[0].toString()];
						sql = mysql.format(sql, insert);
						con.query(sql, function (err, results) {
							if (err) throw err;
							if (results[0] != null) {
								memesChannel.fetchMessage(results[0].messageID.toString()).then(delMes => {
									delMes.delete().catch();
								});
								bot.guilds.get(guildID).members.get(results[0].memberID.toString()).send("Your meme with the title `" + results[0].title + "` has been removed for `" + args.slice(1).join(' ') + "`");
								let sqlDelete = "delete from memes where ID = ?";
								sqlDelete = mysql.format(sqlDelete, insert);
								con.query(sqlDelete, function (error) {
									if (error) throw error;
								});
							}
						})
					}
				}
				break;
		}
	}

	//alle commands die kunnen worden gebruikt in DMs
	else {
		postLog(message, "commandDM", command + " " + args.join(' '));
		let member = bot.guilds.get(guildID).member(message.author);

		//de upload command zelf
		if (command == "upload" && args.length >= 1 && member.roles.has(userRoleID)) {
			//kijkt of er wel iets van een bestand/link wordt doorgegeven
			if (message.attachments.first() != null || (args[args.length - 1].indexOf("http://") == 0 || args[args.length - 1].indexOf("https://") == 0)) {
				let url;
				let title;
				if (message.attachments.first() == null) {
					url = args[args.length - 1];
					title = args.slice(0, -1).join(' ');
				}
				else {
					url = message.attachments.first().url;
					title = args.join(' ');
				}
				postLog(message, "upload", url);
				//pusht het door het filter heen en kijkt of het mag
				let resultOfFilter = await pushImageThroughFilter(url);
				if (resultOfFilter == "KO") {
					message.author.send("This image goes against the rules! If you think this is wrong, contact someone from the Council of Memes.", {
						files: [{
							attachment: './discordStuff/fingerwaving.gif',
							name: "fingerwaving.gif"
						}]
					});
				}
				else {
					//stuurt de meme in de judge kanaal om te laten reviewen
					judgeChannel.send({
						"embed": {
							"description": member.displayName + "(" + member.id + ") posted a new meme\nUse :white_check_mark: to accept it or :negative_squared_cross_mark: to not accept it.\nRemember, only " + bot.guilds.get(guildID).roles.get(headRoleID).toString() + " can self-accept.",
							"title": title,
							"color": 4985197,
							"image": {
								"url": url
							},
							"author": {
								"name": member.displayName,
								"icon_url": member.user.avatarURL
							}
						}
					}).then(async mes => {
						await mes.react(checkMark);
						await mes.react(cross);
						const filter = (reaction) =>
							(reaction.emoji.name == cross || reaction.emoji.name == checkMark);
						const reactionCollector = mes.createReactionCollector(filter);
						reactionCollector.on('collect', reaction => {

							/*checkt welke reactie er werd gepost en of de gebruiker niet zelf de author is (behalve als hij de headrole heeft)
							Als de meme is geaccepteerd, wordt hij gepost in de meme kanaal,
							Als hij wordt geweigerd, wordt hij verwijderd
							de author krijgt een bericht van wat er is gebeurd.*/
							bot.guilds.get(guildID).fetchMember(reaction.users.last().id).then(user => {
								console.log(user.displayName, (user.id != member.id || user.roles.has(headRoleID)) && (user.roles.has(headRoleID) || user.roles.has(councilRoleID)));
								if ((user.id != member.id || user.roles.has(headRoleID)) && (user.roles.has(headRoleID) || user.roles.has(councilRoleID))) {
									if (reaction.emoji.name == cross) {
										member.send("Your meme with the title **" + title + "** was not accepted.");
										reactionCollector.stop();
										mes.delete().catch();
										postLog(user, "voted", { accepted: false, url: url });
									}
									else if (reaction.emoji.name == checkMark) {
										member.send("Your meme with the title **" + title + "** was accepted.");
										con.query("select max(ID)+1 as ID from memes", function (error, results) {
											if (error) throw error;
											let newID;
											if (results[0].ID != null) {
												console.log(results[0]);
												newID = results[0].ID;
											}
											else {
												newID = 1;
											}
											memesChannel.send({
												"embed": {
													"title": title,
													"color": 4985197,
													"image": {
														"url": url
													},
													"author": {
														"name": member.displayName,
														"icon_url": member.user.avatarURL
													},
													"footer": {
														"text": "ID: " + newID
													}
												}
											}).then(async newMeme => {
												await newMeme.react(thumbsUp);
												await newMeme.react(thumbsDown);
												let insertSQL = "insert into memes values (" + newID + ",'" + member.id + "','" + title + "','" + user.id + "','" + url + "','" + newMeme.id + "',0,0,'" + member.displayName + "')";
												console.log(insertSQL);
												con.query(insertSQL, function (err) {
													if (err) throw err;
												});
												reactionCollector.stop();
												mes.delete().catch();
												postLog(user, "voted", { accepted: true, url: url });
											});
										});
									}
								}
							});
						});
					});
				}
			}
			else {
				message.channel.send("You cannot upload nothing, attach something or use an url :angry:");
			}
		}
		else {
			message.channel.send("Invalid Command");
		}
	}

});

//functie die alle reacties telt van elke meme in de database en update ze in de database
function updatePoints() {
	return new Promise(done => {
		con.query("select * from memes", function (err, results) {
			if (err) throw err;
			if (results[0] != null) {
				for (let i = 0; i < results.length; i++) {
					memesChannel.fetchMessage(results[i].messageID).then(meme => {
						let reactions = meme.reactions;
						let amountOfUp;
						let amountOfDown;
						for (let [Snowflake, MessageReaction] of reactions) {
							if (MessageReaction.emoji.name == thumbsUp) {
								amountOfUp = MessageReaction.count - 1;
							}
							else if (MessageReaction.emoji.name == thumbsDown) {
								amountOfDown = MessageReaction.count - 1;
							}
						}
						if (amountOfUp != results[i].likes || amountOfDown != results[i].dislikes) {
							let sql = "update memes set likes = ?, dislikes = ? where messageID = ?";
							let inserts = [amountOfUp, amountOfDown, results[i].messageID];
							sql = mysql.format(sql, inserts);
							con.query(sql, function (error) {
								console.log(sql);
								if (error) throw error;
							});
						}
					});
				}
				done(true);
			}
			else done(null);
		});
	});
}

//functie die wordt gerunt om de topmeme te controleren
function checkTopMeme() {
	con.query("select *, likes-dislikes as points from memes order by points desc, id desc limit 1", function (error, results) {
		if (error) throw error;
		if (results[0] != null) {
			topMemePost = {
				title: results[0].title,
				likes: results[0].likes,
				dislikes: results[0].dislikes,
				imageURL: results[0].url,
				authorName: results[0].username
			};
			memesChannel.fetchMessage(results[0].messageID.toString()).then(topMeme => {
				topChannel.fetchMessage(topMessageID).then(topPost => {
					console.log(topMemePost);
					topPost.edit({
						"embed": {
							"description": "The top Meme from " + topMeme.embeds[0].author.name + "\nTitle: **" + topMeme.embeds[0].title + "**\n:thumbsup: " + results[0].likes + "\n\n:thumbsdown: " + results[0].dislikes + "\n\n[Link to post](" + topMeme.url + ")",
							"color": 159916,
							"image": {
								"url": topMeme.embeds[0].image.url
							},
							"author": {
								"name": topMeme.embeds[0].author.name,
								"icon_url": topMeme.embeds[0].author.iconURL
							},
							"footer":
							{
								"text": "Updates every minute"
							}
						}
					});
				});
			});
		}
	});
}

//filter functie
function pushImageThroughFilter(image) {
	return new Promise(status => {
		var data = {
			url_image: image,
			API_KEY: 'NyrehmaGla9PT6V5SO26Y0wadUwtkNCz',
			task: "porn_detection,suggestive_nudity_detection,weapon_detection,drug_detection,nazis_swastika_detection,obscene_gesture_detection"
		};
		var picpurifyUrl = 'https://www.picpurify.com/analyse.php';
		try {
			request.post({ url: picpurifyUrl, formData: data }, function (err, httpResponse, body) {
				try {
					if (!err && httpResponse.statusCode == 200) {
						console.log(JSON.parse(body));
						status(JSON.parse(body).final_decision);
					}
					else {
						status("ERROR");
					}
				}
				catch (e) {
					status("ERROR");
				}
			});
		}
		catch (e) {
			status("ERROR");
		}
	})
}

//log functie
function postLog(message, identifier, args) {
	switch (identifier) {
		case "command":
			logsChannel.send("<" + message.member.displayName + ":" + message.member.id + "> ran `+" + args + "` on (" + message.createdAt + ")");
			break;
		case "commandDM":
			logsChannel.send("<" + message.author.username + ":" + message.author.id + "> ran `+" + args + "` on (" + message.createdAt + ")");
			break;
		case "upload":
			logsChannel.send("<" + message.author.username + ":" + message.author.id + "> uploaded `" + args + "` on (" + message.createdAt + ")");
			break;
		case "voted":
			logsChannel.send("<" + message.displayName + ":" + message.id + ">\nUrl: " + args.url + "\nAcccepted: " + args.accepted);
			break;
	}
}

//de api call om de top meme te krijgen
app.get('/discord/getTopMeme', function (request, response) {
	console.log(topMemePost, "request");
	response.send(topMemePost);
});
//de api call om een random meme te krijgen
app.get('/discord/getRandomMeme', function (request, response) {
	con.query("select * from memes order by rand() limit 1", function (error, results) {
		if (error) throw error;
		if (results[0] != null) {
			console.log("done");
			response.send({
				title: results[0].title,
				likes: results[0].likes,
				dislikes: results[0].dislikes,
				imageURL: results[0].url,
				authorName: results[0].username
			});
		}
		else {
			response.send(null);
		}
	});
});



/* #endRegion */
/* #region  Inlog */
//apiCall om de kaart toe te voegen, hij geeft een error terug na 10 seconden niks
app.get('/addCard', function (request, response) {
	requestAPI = { "request": request, "response": response, "call": "addCard" };
	timerFunction = setTimeout(function () {
		timerFunction = null;
		requestAPI.response.send("Cannot find a card");
		requestAPI.response.end();
		requestAPI = null;
	}, 10000);
});
//apiCall om uit te loggen van dit accountID
app.get('/logout', function (request, response) {
	loggedIn = false;
	accountID = -1;
	request = null;
	console.log("logged out");
	response.send("logged out");
});
//apiCall om te wachten op een inlog
app.get('/waitForLogin', function (request, response) {
	requestAPI = { "request": request, "response": response, "call": "login" };
});
//api call om de default config te updaten
app.post('/updateDefaultConfig', function(request, response){
	let config = JSON.stringify(request.body);
	fs.writeFile("../widget/default_config.json", config, function(err){
		if(err) throw err;
	});
	response.send();
});
//checkt of het account een admin is, zo ja update hij de default config file
app.post('/isAdmin', function(request, response){
	let accountID = request.body.id;
	let sql = "select canChange from accounts where accountID = ?";
	let insert = [accountID];
	sql = mysql.format(sql, insert);
	con.query(sql, function(error, results){
		if(error) response.send(false);
		if(results[0] != null) {
			console.log(results[0].canChange, typeof(results[0].canChange));
			if(results[0].canChange == 0) response.send(false);
			else {
				fs.writeFile("../widget/default_config.json", JSON.stringify(request.body.config), function(err){
					if(err) throw err;
				});
				response.send(true);
			}
		}
		else response.send(false);
	})
})
//krijgt de config van een ID
app.get('/getConfigFromID', function (request, response) {
	let accountID = request.query.ID;
	console.log(request.query.ID, accountID);
	let sql = "select config, canChange from accounts where accountID = ?";
	let insert = [accountID];
	sql = mysql.format(sql, insert);
	console.log(sql);
	con.query(sql, function (error, results) {
		console.log(results);
		if (error) {
			response.send(null);
			throw error;
		}
		if (results[0] == null) {
			response.send(null);
		}
		else {
			response.send({
				"config":results[0].config,
				"admin":results[0].canChange
			});
		}
	});
});
//set een config van een id
app.post('/setConfigForID', function (request, response) {
	console.log(request.body);
	let accountID = request.body.id;
	let newConfig = request.body.config;
	console.log(accountID, newConfig);
	let sql = "update accounts set config = ? where accountID = ?";
	let inserts = [JSON.stringify(newConfig), accountID];
	sql = mysql.format(sql, inserts);
	con.query(sql, function (error) {
		if (error) throw error;
	});
	response.send();
});

app.post('/api/Upload', function(req, res) {
	console.log(req.body);
});


//runt deze functie al er een nieuwe bericht wordt gepublished op het sub kanaal
mqttClient.on('message', async function (topic, message) {
	if (requestAPI != null) {
		let hashValue = message.toString();
		console.log("Got from card reader", hashValue);
		if (!loggedIn && requestAPI.call == "login") {
			clearTimeout(timerFunction);
			timerFunction = null;
			//krijgt alle kaarten van de database waar de cardID gelijk is aan diegene gekregen van de card reader
			//om te kijken of de kaart al bestaat.
			let sql = "select * from cards where cardID = ?";
			let insert = [hashValue];
			sql = mysql.format(sql, insert);
			con.query(sql, async function (error, results) {
				if (error) throw error;
				if (results[0] == null) {
					console.log("cardID not in database, making a new account");
					let randomIndex;
					while (true) {
						randomIndex = Math.floor(Math.random() * 10000);
						console.log(randomIndex);
						let reply = await checkRandomIndex(randomIndex);
						if (reply) break;
					}
					//maakt een nieuwe account en nieuwe kaart en linkt ze met elkaar
					let insertAccountsSql = "insert into accounts (accountID, config) values (?,?)";
					let insertAccountsInserts = [randomIndex, null];
					insertAccountsSql = mysql.format(insertAccountsSql, insertAccountsInserts);
					let insertCardsSql = "insert into cards values (?,?)";
					let insertCardsInserts = [hashValue, randomIndex];
					insertCardsSql = mysql.format(insertCardsSql, insertCardsInserts);
					con.query(insertAccountsSql, function (error) {
						if (error) throw error;
						console.log("Succesfully created account with ID", randomIndex);
						con.query(insertCardsSql, function (err) {
							//stuurt de accountID terug naar de webpagina
							if (err) throw err;
							console.log("Succesfully added this card to account", randomIndex);
							accountID = randomIndex;
							loggedIn = true;
							requestAPI.response.send(accountID.toString());
							requestAPI.response.end();
							requestAPI = null;
						});
					});

				}
				else {
					//stuurt de accountID terug naar de webpagina
					clearTimeout(timerFunction);
					timerFunction = null;
					console.log("cardID in database", results[0].accounts_accountID);
					accountID = results[0].accounts_accountID;
					loggedIn = true;
					requestAPI.response.send(accountID.toString());
					requestAPI.response.end();
					requestAPI = null;
				}
			});
		}
		else if (requestAPI.call == "addCard") {
			//probeert de gelezen kaart toe te voegen aan een account
			clearTimeout(timerFunction);
			timerFunction = null;
			console.log("addCard");
			let sql = "insert into cards values (?,?)";
			let inserts = [hashValue, accountID];
			sql = mysql.format(sql, inserts);
			con.query(sql, function (error) {
				let statusOfAdd = "Succesfully linked this card!";
				//als het een error geeft (als de kaart al bestaat)
				if (error) {
					statusOfAdd = "Card is already linked!";
				}
				//stuurt de status van de toevoeging naar de webpagina
				console.log(statusOfAdd);
				requestAPI.response.send(statusOfAdd);
				requestAPI.response.end();
				requestAPI = null;
			});
		}
	}
});

//functie om een index te checken voor de accountID
function checkRandomIndex(random) {
	return new Promise(resolve => {
		con.query("select accountID from accounts where accountID = " + random, function (error, results) {
			if (error) throw error;
			if (results[0] == null) resolve(true);
			else resolve(false);
		});
	});
}
/* #endregion */
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
/* #region Shadowall*/
mqttShadowall.on('connect', function() {
	console.log("test");
});
//stuurt een bericht om de shadow wall aan te zetten
app.get('/turnShadowOn', function (request, response) {
	mqttShadowall.publish(mqttShadowallPub,'1',optionsShadowall);
	response.send(null);
});
//stuurt een bericht om de shadow wall uit te zetten
app.get('/turnShadowOff', function (request, response) {
	mqttShadowall.publish(mqttShadowallPub,'0',optionsShadowall);
	response.send(null);
});
//stuurt een bericht om een individuele lijn aan te zetten
app.get('/setLine', function (request, response) {
	let line = request.query.line;
	let board = request.query.board;
	console.log(line);
	mqttShadowall.publish("/esps/" + board + "-0", line, optionsShadowall);
	response.send(null);
});
/* #endregion*/
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at:', reason.stack || reason)
});

setInterval(function () {
    con.query('SELECT 1', [], function () {})
}, 60000);