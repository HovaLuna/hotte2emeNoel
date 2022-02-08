const port = 3000;
const tmi = require("./tmi.js");
const reactions = require("./reactions.js");
const ids = require("./ids.json");
const prefix = "!";
const sqlite = require('sqlite3').verbose();
var { exec } = require('child_process');
var pathCmdDB = './channel.db';
var channelId = "";
const express = require('express');
const { writeFileSync, readFile, fstat } = require("fs");
const { time, debug } = require("console");
const { token } = require("./tmi.js/lib/utils.js");
var clientId = "";
var oauthToken = "";
var secret = "";
var tokenOk = false;
var accessToken = "";
var refreshToken = "";
var broadId = "";

/**
 * Permission level for a viewer.
 */
const roles = {
	ALL: 1,
	VIP: 2,
	SUB: 3,
	MODO: 4,
	BROAD: 5,
	properties: {
		1: { name: "all", value: 1 },
		2: { name: "vip", value: 2 },
		3: { name: "sub", value: 3 },
		4: { name: "modo", value: 4 },
		5: { name: "broad", value: 5 }
	}
}

/**
 * Parameters for a bot who will connect to Twitch.
 */
const tmiConfig = {
	options: {
		debug: true,
		messagesLogLevel: "info"
	},
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: "",
		password: ""
	},
	channels: [
		'HovaLuna'
	]
};

var getIdentity = function(){
	tmiConfig.identity.username = ids.username;
	tmiConfig.identity.password = ids.password;
	clientId = ids.clientId;
	oauthToken = ids.oauthToken;
	accessToken = ids.oauthToken;
	secret = ids.secret;
	console.log(tmiConfig);
}

getIdentity();


//Connection to DB in write and reading mode.
let dbCmd = new sqlite.Database(pathCmdDB, sqlite.OPEN_READWRITE, (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log("Connected to the database.");
});

//(Re)create the table for commands.
dbCmd.run('CREATE TABLE cmds(idCmd INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255) NOT NULL UNIQUE, perm INTEGER DEFAULT 1, rep varchar(255) NOT NULL, descri varchar(255), group varchar(255), statut INTEGER DEFAULT 1)', function (err) {
	if (err) {
		console.error(err + "");
	}
});


//(Re)create the table for levels.
dbCmd.run('CREATE TABLE levels(idCmd INTEGER PRIMARY KEY AUTOINCREMENT, name varchar(255) NOT NULL UNIQUE, publicName varchar(255) NOT NULL UNIQUE, rank varchar(255), lvl INTEGER DEFAULT 1, exp INTEGER DEFAULT 0)', function (err) {
	if (err) {
		console.error(err + "");
	}
});

//Connect the server to localhost:<port>.
const server = express();
server.set('port', process.env.PORT || port);
server.listen(port, () => {
	console.log('Express server started at port ' + port);
});


'version 0Auth implicit code flow = token unique?'
/*server.get('/auths', (request, response) => {
	console.log("url: " + request.url);
	console.log("host: " + request.get('host'));
	console.log("prot: " + request.protocol);
	console.log("orig: " + request.originalUrl);
	console.log("request: ");
	console.log(request.query.code);
	accessToken = request.query.code;

	varsToSend = "get code";
	if (request.query.mode == undefined) {		//show the page with current value
		response.sendFile(__dirname + "/authsUnique.html");
	} else {
		response.json(varsToSend);
	}
});*/

'Version 0Auth authorization code flow'
server.get('/auths', (request, response) => {
	console.log("url: " + request.url);
	console.log("host: " + request.get('host'));
	console.log("prot: " + request.protocol);
	console.log("orig: " + request.originalUrl);
	console.log("request: ");
	console.log(request.query.code);

	varsToSend = "get code";
	if (request.query.code == undefined || request.query.code == "login") {		//show the page with current value
		console.log("get auths undefined or login");
		response.sendFile(__dirname + "/authsUnique.html");
	}else if(request.query.code == "logout"){
		console.log("get auths logout");
		//response.sendFile(__dirname + "/welcome.html"); à ajouter
		response.writeHead(301,
			{Location: '/welcome'}
		);
		response.end();
	} else{
		console.log("get auths");
		client.api({
			url: 'https://id.twitch.tv/oauth2/token?client_id='+ clientId + '&client_secret='+ secret +'&&code=' + request.query.code + '&grant_type=authorization_code&redirect_uri=http://localhost:3000/auths/',
			method: 'POST'
		}, function(err, res, body){
			if (err){
				console.log(err);
				response.json(varsToSend);
			}else{
				accessToken = body.access_token;
				refreshToken = body.refresh_token;
				console.log("accessToken: " + accessToken);
				console.log("refreshToken: "+ refreshToken);

				ids.oauthToken = accessToken;
				
				console.log("call id from auths");
				var channelName = tmiConfig.channels[0].substring(1);
				console.log("query donné:" + channelName);
				getChannelId(channelName,function(result){
					console.log("result: " + result);
				});
				updateJSON("./ids.json");

				/*response.writeHead(301,
					{Location: '/home'}
				);*/
				response.end();
			}
		});
	}
});

server.get('/home', (request, response) =>{
	console.log("I'm home");
	response.sendFile(__dirname + "/authsUnique.html");
});

//Event for communication with index.html page.
server.get('/index/', (request, response) => {
	//console.log(request);
	const _scope = "channel:moderate%20channel:read:subscriptions%20channel:manage:broadcast%20channel:read:redemptions%20bits:read+chat:edit%20chat:read%20user:read:broadcast%20user:read:email";
	const _oauth = oauthToken;

	/*writeFile("./ids.txt", request.query.code, (err) =>{
		if (err) console.log(err);
	})*/
	console.log("accès index");
	getIdentity();
	console.log("old:" + channelId);
	var channelName = tmiConfig.channels[0].substring(1);
	console.log("call id from index");
	getChannelId(channelName, function(result){
		console.log("new:" + result);
		//ids.oauthToken = request.query.code;
		console.log("req oauth:" + ids.oauthToken);
		//updateJSON("./ids.json");
		console.log("url:" + server.url);
		
		console.log("change location to home");
		response.writeHead(301,
			{Location: '/home'}
		);
		response.end();
	});
	
});

function updateJSON(filename){
	writeFileSync(filename, JSON.stringify(ids, null, 2), function writeJSON(err) {
		if (err) {
			console.log(err);
		}else{
			console.log(JSON.stringify(ids));
			console.log(JSON.stringify(username));
		}
	});
}

//Event for communication with levels.html page.
server.get('/levels', (request, response) => {
	let varsToSend = "";
	let success = false;
});

//Event for communciation witch cmds.html page.
server.get('/cmds', (request, response) => {
	let varsToSend = "";
	let success = false;

	if (request.query.mode == undefined) {		//show the page with current value
		response.sendFile(__dirname + "/cmds.html");
	} else {
		if (request.query.mode.indexOf("modif") > -1) {		//the page communicate a modification for a command
			dbCmd.run('UPDATE cmds SET name = "' + request.query.name.replace("!", "") + '", perm = ' + request.query.perm + ', rep = "' + request.query.rep + '", statut = ' + request.query.statut + ' WHERE idCmd = ' + request.query.idCmd.replace("save-", ""), function (err) {
				if (err) {
					console.log(err);
					console.log("Une erreur est survenue lors de la mise à jour de la commande " + request.query.name);
				} else {
					success = true;
					console.log("La commande " + request.query.name + " a bien été modifiée");
				}
			});
		} else if (request.query.mode.indexOf("statut") > -1) {		//the page communicate a modification of changement of status for a command
			console.log(request.query.statut);
			dbCmd.run('UPDATE cmds SET statut = ' + request.query.statut + ' WHERE idCmd = ' + request.query.idCmd.replace("statut-", ""), function (err) {
				if (err) {
					console.log(err);
					console.log("Une erreur est survenue lors de la mise à jour de la commande " + request.query.idCmd);
				} else {
					success = true;
					if (request.query.statut.indexOf("1") > -1) {
						console.log("La commande " + request.query.idCmd + " a bien été activée");
					} else {
						console.log("La commande " + request.query.idCmd + " a bien été désactivée");
					}
				}
			});
		} else if (request.query.mode.indexOf("add") > -1) {		//the page communicate a creation of a command
			console.log("perm= " + request.query.perm);
			console.log(request.query.statut);
			dbCmd.run('INSERT INTO cmds(name, rep, perm, statut) VALUES("' + request.query.name.replace("!", "") + '","' + request.query.rep + '", ' + request.query.perm + ', ' + request.query.statut + ')', function (err) {
				if (err) {
					console.log(err);
					console.log("Une erreur est survenue lors de la création de la commande " + request.query.name);
				} else {
					console.log("commande ajoutée");
					console.log("La commande " + request.query.name + " a bien été ajoutée");
				}
			});
		} else if (request.query.mode.indexOf("suppr") > -1) {		//the page communicate a suppression of a command
			dbCmd.run('DELETE FROM cmds WHERE idCmd = ' + request.query.idCmd.replace("suppr-", ""), function (err) {
				if (err) {
					console.log(err);
					console.log("Une erreur est survenue lors de la suppression de la commande " + request.query.name);
				} else {
					console.log("La commande " + request.query.name + " a bien été supprimée");
				}
			});
		}

		//Print all commands in the database.
		var req = 'SELECT * FROM cmds ORDER BY idCmd DESC ';
		dbCmd.all(req, [], (err, rows) => {
			if (err) {
				console.log(err);
				console.log("Une erreur est survenue lors de l'affichage des commandes");
			} else {
				rows.forEach((row) => {
					varsToSend += '<tr id=' + row.idCmd + '>';
					varsToSend += '<td id=idCmd-' + row.idCmd + '>' + row.idCmd + '</td>';
					varsToSend += '<td id="name-' + row.idCmd + '">!' + row.name + '</td>';
					varsToSend += '<td id="rep-' + row.idCmd + '">' + row.rep + '</td>';
					varsToSend += '<td id="perm-' + row.idCmd + '">' + row.perm + ' - ' + roles.properties[row.perm].name + '</td>';
					varsToSend += '<td id="statut-' + row.idCmd + '"><label class="switch"><input type="checkbox" name="statut"';
					if (row.statut == 1) {
						varsToSend += ' checked';
					}
					varsToSend += '><span class="statut" ontransitionend=refresh(event)></span></label>';
					varsToSend += '<td><button id=modif-' + row.idCmd + ' onclick=modify(event)>Modifier</button><button id=suppr-' + row.idCmd + ' onclick=refresh(event)>Supprimer</button></td></tr>';
				});
			}
			response.json(varsToSend);
		});
	}
});

//Connect the bot to the client twitch channel.
let client = new tmi.client(tmiConfig);
console.log(tmiConfig.identity.password);
client.connect().catch(console.error);

var checkToken = function(){
	const _scope = "channel:moderate%20channel:read:subscriptions%20channel:manage:broadcast%20channel:read:redemptions%20bits:read+chat:edit%20chat:read%20user:read:broadcast%20user:read:email";
	const _oauth = oauthToken;
	console.log("check token");
	//exec('start "" "https://id.twitch.tv/oauth2/authorize?client_id='+ clientId + '&response_type=token&scope='+ _scope +'&force_verify=true&redirect_uri=http://localhost:3000/auths/"', (error, stdout, stderr) => {
	exec('start "" "https://id.twitch.tv/oauth2/authorize?client_id='+ clientId + '&response_type=code&scope='+ _scope +'&force_verify=true&redirect_uri=http://localhost:3000/auths/"', (error, stdout, stderr) => {
		if (error){
			console.log(error);
			return;
		}
	});
	/*client.api({
		url: 'https://id.twitch.tv/oauth2/token?client_id='+clientId +'&client_secret='+secret+'&code='+ _oauth +'&grant_type=authorization_code&redirect_uri=http://localhost:3000/auths/',
		method: 'POST'
	}, function(err, res, body){
		console.log(res.statusCode);
		if (err){
			console.log(err);
		}else{
			console.log(res);
			console.log(body);
			console.log("try to validate");
			client.api({
				url: 'https://id.twitch.tv/oauth2/validate',
				method: 'POST',
				headers : {
					'Authorization': 'OAuth ' + _oauth
				}
			}, function(err, res, body){
				if (err){
					console.log(err);
				}else{
					console.log(res);
					console.log(body);
				}
			});
		}
	});*/
}

//Event for the bot connection to the client twitch channel
client.on('connected', (adress, port) => {
	console.log(client.getUsername() + " s'est connecté sur : " + adress + ", port : " + port);
	client.say(tmiConfig.channels[0], "Hello Twitch ! I'm a real human Kappa"); //il spamme trop le con
	exec('start "" "http://localhost:3000/index/"');
	/*client.api({
		url: "https://id.twitch.tv/oauth2/validate",
		method: "GET",
		headers: {
			//"Accept": "application/vnd.twitchtv.v5+json",
			'Authorization': 'OAuth ' + oauth
		}
	}, function(err, res, body){
		if (err){
			console.log(err);
		}else{
			console.log(res);
			console.log(body);
		}
	});*/
	/*client.api({
		url:'"https://id.twitch.tv/oauth2/authorize?response_type=code&client_id="'+tmiConfig.identity.clientId+'"&redirect_uri=https://localhost:3000/auths/&scope=channel:moderate+bits:read+channel:read:subscriptions+chat:edit+chat:read+channel_editor+user_blocks_read+channel:read:redemptions+moderation:read+user:read:broadcast+user:edit:broadcast&force_verify=true"',
		method: "GET",
	}, function(err, res, body){
		if (err){
			console.log(err);
			console.log("une erreur est survenue");
		}else{
			console.log(res);
			console.log(body);
		}
	});*/
	/*exec('start "" "https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=okwwebdh0aua9s28aemjtdecybmj5c&redirect_uri=https://localhost/&scope=channel:moderate+bits:read+channel:read:subscriptions+chat:edit+chat:read+channel_editor+user_blocks_read+channel:read:redemptions+moderation:read+user:read:broadcast+user:edit:broadcast&force_verify=true"');*/
	/*client.api({
		url: "https://id.twitch.tv/oauth2/authorize?client_id="+tmiConfig.identity.clientId+"&redirect_uri=http://localhost&response_type=Bearer&scope=channel:read:subscriptions user:read:broadcast",
		"Accept": "application/vnd.twitchtv.v5+json",
		method: "GET"
		url: 'https://id.twitch.tv/oauth2/authorize?response_type=code&client_id='+tmiConfig.identity.clientId+'&redirect_uri=https://localhost/&scope=viewing_activity_read&state='+tmiConfig.identity.password,
		method: "GET"
	}, function(err, res,  body){
		if (err){
				console.log(err);
				console.log("une erreur est survenue");
		}else{
			console.log(res.state);
			console.log(res.nonce);
		}
	});*/
});

/**
 * Parse the message to get just the value after the prefix.
 * 
 * @param {string} message the given message.
 */
function commandParser(message) {
	let prefixEscaped = prefix.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	let regex = new RegExp("^" + prefixEscaped + "([a-zA-Z]+)\s?(.*)");
	return regex.exec(message);
}

 /**
  * Get all current chatters <not used>.
  * 
  * @param {string} channel the client twitch channel.
  * @param {} callback the callback of the function. 
  */
function getChatters(channel, callback) {
	client.api({
		url: "'https://api.twitch.tv/helix/streams?game_id=33214",
		method: "GET",
		headers: {
			"Client-ID": tmiConfig.identity.clientId
		}
	}, function (err, res, body) {
		console.log(body);
	});
}

/**
 * Get the user id
 * 
 * @param {string} userName the username to search.
 */
function getUserId(userName) {
	return getId(userName, "users?login=");
}

/**
 * Get the channel id <not used>.
 * 
 * @param {string} channelName the channel name to search.
 */
var getChannelId = function(channelName, callback) {
	let urlParam = "search/channels?query=";
	console.log("query reçue: " + channelName.trim());
	client.api({
		url: "https://api.twitch.tv/helix/" + urlParam + channelName,
		method: "GET",
		headers: {
			"Authorization": "Bearer " + accessToken,
			"Client-ID": ids.clientId
		}
	}, function (err, res, body) {
		if(err) throw err;
		console.log("id?");
		console.log(accessToken);
		console.log(ids.clientId);
		let posData = 0;
		let tmpPos = 0;

		if(body.data==undefined){
			console.log("data undefined");
			console.log(body);
			checkToken();
		}else{
			body.data.forEach(element =>{
				if(element.broadcaster_login.trim() == channelName.trim()){
					console.log("found: " + element.broadcaster_login);
					posData = tmpPos;
				}else{
					tmpPos = tmpPos + 1;
				}
			});
			console.log("posData: " + posData);
			console.log(body.data[posData]);
			channelId = body.data[posData].id;
			console.log(channelId);
			broadId = channelId;
			callback(broadId);
		}
	});
}

/**
 * Get the id value.
 * 
 * @param {string} name the champ to read.
 * @param {string} urlParam the part of url to execute.
 */
function getId(name, urlParam) {
	let result = "";
	client.api({
		url: "https://api.twitch.tv/helix/" + urlParam + name,
		method: "GET",
		headers: {
			"Client-ID": tmiConfig.identity.clientId
		}
	}, function (err, res, body) {
		console.log("id?");
		console.log(body);
		channelId = body.data[0].id;
	});
	console.log(result);
	return result;
}

/**
 * Get the permission level of the user.
 * 
 * @param {string} user the given user.
 * @param {string} channel the channel where the user chat.
 * @param {} callback the callback function.
 */
function getRole(user, channel, callback) {
	client.api({
		url: "https://api.twitch.tv/helix/users?login=" + channel.substr(1),
		headers: {
			"Accept": "application/vnd.twitchtv.v5+json",
			"Client-ID": tmiConfig.identity.clientId,
			"Authorization": "Bearer " + tmiConfig.password
		},
		method: "GET"
	}, function (err, res, body) {
		console.log(body);
		client.api({
			url: "https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=" + body.data[0].id,
			headers: {
				"Authorization": "Bearer " + tmiConfig.identity.password.substr(6),
				"Accept": "application/vnd.twitchtv.v5+json",
				"Client-ID": tmiConfig.identity.clientId
			},
			method: "GET"
		}, function (err, res, body) {
			console.log(body);
			/*var role = roles.ALL;
			if(err){
				console.log(err);
				role = roles.ALL;
			}else{
				role = roles.ALL;
				if (body.chatters.broadcaster.indexOf(user.username)!= -1){
					role = roles.BROAD;
					console.log(parseInt(role));
				}else if (body.chatters.moderators.indexOf(user.username)!= -1){
					role = roles.MODO;
				}else if (user.subscriber == true){
					role = roles.SUB;
				}else if (body.chatters.vips.indexOf(user.username) != -1){
					role = roles.VIP;
				}
			}*/
			callback(role);
		});
	});
}

//Event for the chat interaction where the bot stand.
client.on('chat', (channel, user, message, isSelf) => {
	if (isSelf) return;		//the bot not ready his self message

	let fullCommand = commandParser(message);

	if (fullCommand) {

		let command = fullCommand[1];
		let param = fullCommand[2];
		param = param.substr(1);
		console.log(command);

		getRole(user, channel, function (role) {
			switch (command) {

				case "bonjour":		//Reaction of the bot to !bonjour
					client.say(channel, "Bonjour à toi " + user['display-name']);
					break;

				case "cmdadd":		//Reaction of the bot to !cmdadd --> to add a command
					if (param != "" && role >= roles.MODO) {
						let cmdName = "";
						let cmdRep = "";
						let splitParam = param.split(" ");		//get all parameters
						cmdName = splitParam[0];
						if (param.length > cmdName.length + 2) {	//check if there is 2 parameters minimum
							cmdRep = param.substr(cmdName.length + 1);
							cmdName = cmdName.replace("!", "");

							//check if the command already exist.
							var req = 'SELECT * FROM cmds WHERE name = "' + cmdName + '"';
							dbCmd.all(req, [], (err, rows) => {
								console.log(rows.length);
								if (err) {
									console.log(err);
								} else if (rows.length > 0) {		//the command already exist
									dbCmd.run('UPDATE cmds SET rep = "' + cmdRep + '" WHERE name = "' + cmdName + '"', function (err) {
										if (err) {
											console.log(err);
											client.say(channel, "Une erreur est survenue lors de la mise à jour de la commande !" + cmdName);
										} else {
											console.log("commande mise à jour");
											client.say(channel, "La commande " + cmdName + " a bien été modifiée");
										}
									});
								} else {		//the command not exist
									dbCmd.run('INSERT INTO cmds(name, rep) VALUES("' + cmdName + '","' + cmdRep + '")', function (err) {
										if (err) {
											console.log(err);
											client.say(channel, "Une erreur est survenue lors de la création de la commande !" + cmdName);
										} else {
											console.log("commande ajoutée");
											client.say(channel, "La commande " + cmdName + " a bien été ajoutée");
										}
									});
								}
							});
						}
					}
					break;

				case "cmdperm":		//Reaction of the bot to change the permission level of a command
					if (param != "" && role >= roles.MODO) {
						let cmdName = "";
						let cmdPerm = "";
						let splitParam = param.split(" ");
						let find = false;
						let cpt = 0;
						cmdName = splitParam[0];
						cmdPerm = param.substr(cmdName.length + 1);
						cmdName = cmdName.replace("!", "");

						//check if the permission level of the user is enough
						for (cpt = roles.ALL; cpt <= roles.BROAD && !find; cpt++) {
							find = cpt == parseInt(cmdPerm) || roles.properties[cpt].name == cmdPerm;
						}
						if (find) {
							dbCmd.run('UPDATE cmds SET perm = ' + roles.properties[cpt - 1].value + ' WHERE name = "' + cmdName + '"', function (err) {
								if (err) {
									console.log(err);
									client.say(channel, "Une erreur est survenue lors de la mise à jour de la commande !" + cmdName);
								} else {
									client.say(channel, "La commande !" + cmdName + " a bien été modifiée avec la permission " + roles.properties[cpt - 1].name);
								}
							});
						}
					}
					break;

				case "cmddel":		//Reaction of the bot to delete a command
					param = param.replace("!", "");
					if (param != "" && role >= roles.MODO) {
						var req = 'SELECT * FROM cmds WHERE name = "' + param + '"';
						dbCmd.all(req, [], (err, rows) => {
							if (err) {
								console.log(err);
							} else if (rows.length > 0) {
								dbCmd.run('DELETE FROM cmds WHERE name = "' + param + '"', function (err) {
									if (err) {
										console.log(err);
										client.say(channel, "Une erreur est survenue lors de la suppression de la commande !" + cmdName);
									} else {
										client.say(channel, "La commande " + param + " a bien été supprimée");
									}
								});
							}
						});
					}
					break;

				case "cmdon":		//Reaction of the bot to enable a command
					param = param.replace("!", "");
					if (param != "" && role >= roles.MODO) {
						var req = 'SELECT * FROM cmds WHERE name = "' + param + '"';
						dbCmd.all(req, [], (err, rows) => {
							if (err) {
								console.log(err);
							} else if (rows.length > 0) {
								dbCmd.run('UPDATE cmds SET statut = 1 WHERE name = "' + param + '"', function (err) {
									if (err) {
										console.log(err);
										client.say(channel, "Une erreur est survenue lors de la mise à jour de la commande !" + param);
									} else {
										client.say(channel, "La commande !" + param + " a bien été activée");
									}
								});
							}
						});
					}
					break;


				case "cmdoff":		//Reaction of the bot to disable a command
					param = param.replace("!", "");
					if (param != "" && role >= roles.MODO) {
						var req = 'SELECT * FROM cmds WHERE name = "' + param + '"';
						dbCmd.all(req, [], (err, rows) => {
							if (err) {
								console.log(err);
							} else if (rows.length > 0) {
								dbCmd.run('UPDATE cmds SET statut = 0 WHERE name = "' + param + '"', function (err) {
									if (err) {
										console.log(err);
										client.say(channel, "Une erreur est survenue lors de la mise à jour de la commande !" + param);
									} else {
										client.say(channel, "La commande !" + param + " a bien été désactivée");
									}
								});
							}
						});
					}
					break;

				case "getfollow":		//Reaction of the bot to get the followers list
					if (role == roles.BROAD) {
						client.api({
							url: "https://api.twitch.tv/kraken/users?login=hovaluna",
							method: "GET",
							headers: {
								"Accept": "application/vnd.twitchtv.v5+json",
								"Client-ID": tmiConfig.identity.clientId
							}
						}, function (err, res, body) {
							console.log(body);
							channelId = body.users[0]._id;
							console.log("id: " + channelId);
							client.api({
								url: "https://api.twitch.tv/kraken/channels/" + channelId + "/follows?direction=asc",
								method: "GET",
								headers: {
									"Accept": "application/vnd.twitchtv.v5+json",
									"Client-ID": tmiConfig.identity.clientId
								}
							}, function (err, res, body) {
								console.log(body.follows[1]);
							});
						});
					}
					break;

				case "getchat":		//Reaction of the bot to print the level permission
					if (role == roles.BROAD) {
						client.api({
							url: "http://tmi.twitch.tv/group/user/" + channel.substr(1) + "/chatters",
							method: "GET"
						}, function (err, res, body) {
							console.log(body);
							let modos = body.chatters.moderators;
							let vips = body.chatters.vips;
							let streamer = body.chatters.broadcaster;
							console.log(modos);
							console.log(vips);
							console.log(user);
							console.log(user.username);
							console.log(streamer);
							client.say(channel, streamer[0]);
							client.say(channel, user.username + " est un modo: " + modos.indexOf(user.username));
							client.say(channel, user.username + " est un vip: " + vips.indexOf(user.username));
							client.say(channel, user.username + " est le streamer: " + body.chatters.broadcaster.indexOf(user.username));
						});
					}
					break;

				case "getviews":	//Reaction of the bot to print in console the id of the viewer
					if (role == roles.BROAD) {
						client.api({
							url: "http://api.twitch.tv/kraken/users?login=" + channel.substr(1),
							headers: {
								"Accept": "application/vnd.twitchtv.v5+json",
								"Client-ID": tmiConfig.identity.clientId
							},
							method: "GET"
						}, function (err, res, body) {
							console.log(body);
							console.log(body.users[0]._id);
							/*client.api({
								url: "https://api.twitch.tv/helix/streams?user_id="+body['user-id'],
								method: "GET"
							}, function(err, res, body) {
								console.log(body);
							});*/
						});
					}
					break;

				case "get":		//?
					if (role == roles.BROAD) {
						client.api({
							url: "http://api.twitch.tv/kraken",
							headers: {
								"Accept": "application/vnd.twitchtv.v5+json",
								"Client-ID": tmiConfig.identity.clientId
							},
							method: "GET"
						}, function (err, res, body) {
							console.log(body);
							/*client.api({
								url: "https://api.twitch.tv/helix/streams?user_id="+body['user-id'],
								method: "GET"
							}, function(err, res, body) {
								console.log(body);
							});*/
						});
					}
					break;

				default:	//Reaction of the bot to any command who exist in the cmds database
					var req = 'SELECT * FROM cmds WHERE name = "' + command + '"';
					dbCmd.all(req, [], (err, rows) => {
						if (err) {
							console.log(err);
						} else {
							rows.forEach((row) => {
								if (row.perm <= parseInt(role) && row.statut == 1) {
									client.say(channel, row.rep);
								}
								console.log("perm: " + row.perm);
							});
						}
					});
			}
		});
	} else {	//Reaction of the bot to a specific word in the reactions list
		let words = message.toLowerCase().split(" ");
		for (let word of words) {
			let reaction = reactions[word];
			if (reaction) {
				client.say(channel, reaction);
			}
		}
	}
});