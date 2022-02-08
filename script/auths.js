window.onload = (event) => {
	var code = window.location.search;
	code = code.substring(code.indexOf("=")+1, code.indexOf("&"));
	console.log(window.location);
	console.log(code);

	var id_token = window.location.hash;
	var access_token = window.location.hash;
	var label_id = "id_token";
	var label_access = "access_token";
	id_token = id_token.substring(id_token.indexOf(label_id)+label_id.length+1, id_token.indexOf("&", id_token.indexOf(label_id)));
	access_token = access_token.substring(access_token.indexOf(label_access)+label_access.length+1, access_token.indexOf("&", access_token.indexOf(label_access)));
	getUserInfo(event);
}

function getUserInfo(e){
	var id_token = window.location.hash;
	var access_token = window.location.hash;
	var label_id = "id_token";
	var label_access = "access_token";
	id_token = id_token.substring(id_token.indexOf(label_id)+label_id.length+1, id_token.indexOf("&", id_token.indexOf(label_id)));
	access_token = access_token.substring(access_token.indexOf(label_access)+label_access.length+1, access_token.indexOf("&", access_token.indexOf(label_access)));
	$.ajax({
		url : 'https://id.twitch.tv/oauth2/userinfo',
		method: 'GET',
		headers: {
			"Authorization": " Bearer " + access_token
		},
		success : function(data){
			document.innerHTML = data;
			console.log('Success userinfo:');
			console.log(data);
			window.location.href="https://hotte2emenoel.000webhostapp.com/monProfil?token="+access_token+"&id_user="+data.sub;
			$.ajax({
				url : 'https://api.twitch.tv/helix/users?id='+data.sub,
				method: 'GET',
				headers: {
					"Authorization": " Bearer " + access_token,
					"Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
				},
				success : function(data){
					document.innerHTML = data;
					console.log('Success channels:');
				},
				error: function(err){
					console.log(err);
					console.log('Failed channels');
				}
			});
		},
		error: function(err){
			console.log(err);
			console.log('Failed userinfo');
		}
	});
	
}