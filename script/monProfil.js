var access_token = window.location.search;
var id_user = window.location.search;
var label_token = "token";
var label_user = "id_user";
var label_tickets = "countTickets";


/**
 * Au chargement de la page
 */
window.onload = (event) => {
    
    //Mise à jour des cookies avec le token et l'idUser.
    updateCookies();

    //Récupération du pseudo et de l'avatar
    getPseudoAvatar();
    
    //Mise à jour du token pour l'identification future
    updateToken();
    
    //Empêche la sauvegarde de l'historique et réécriture de l'url
    if (window.history.replaceState) {
        window.history.replaceState({}, "", "https://hotte2emenoel.000webhostapp.com/monProfil");
    }
    
    //Gestion des éléments collapsables
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
      });
    }
    
    //Récupération des clés offertes.
    ShowGivenKeys();
    
    //Récupération des tickets gagnés.
    showTickets();
    
    //Affichage de l'option pour ajouter un gagnant
    showOptionAdmin()
}

//Fonction pour afficher les options administrateurs
function showOptionAdmin(){
    var opt = document.getElementById("newWinner").parentNode;
    if(getCookie(label_user) == "119536604" /*hovaluna*/ || getCookie(label_user) == "52297247"){
        opt.style.display="block";
    }else{
        opt.style.display="none";
    }
}

//Fonction pour choisir un nouveau gagnant
function newWinner(e){
    document.getElementById("newWinner").disabled = true;
    document.getElementById("myDropdownWinner").classList.toggle("show");
    document.getElementById("btnCancelWin").parentNode.style.display="block";
    document.getElementById("btnCancelWin").style.display="inline";
    document.getElementById("btnValidWin").style.display="none";
}

function giveTicket(e){
    document.getElementById("choice").disabled=true;
    document.getElementById("give").disabled = true;
    document.getElementById("myDropdownLucky").classList.toggle("show");
    document.getElementById("btnCancelLucky").parentNode.style.display="block";
    document.getElementById("btnCancelLucky").style.display="inline";
    document.getElementById("btnValidLucky").style.display="none";
}

function searchPseudo(e){
    var searchId = ""
    if(e.target.id=="myInputWinner"){
        searchId="users"
    }else if(e.target.id=="myInputLucky"){
        searchId="lucky";
        console.log(e.target);
    }
    if(e.target.value.length>2){
        $.ajax({
            url : 'https://api.twitch.tv/helix/users?login='+e.target.value,
            method: 'GET',
            headers: {
                "Authorization": " Bearer " + getCookie(label_token),
                "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
            },
            success : function(data){
                console.log(data);
                var datalist = document.getElementById(searchId).children[0];
                console.log(datalist.children);
                var opt = datalist.children[1];
                opt.textContent = data.data[0].display_name;
                opt.id = data.data[0].id;
                console.log(opt);
            },
            error: function(err){
                console.log(err);
            }
        });
        $.ajax({
            url : 'https://api.twitch.tv/helix/search/channels?query='+e.target.value,
            method: 'GET',
            headers: {
                "Authorization": " Bearer " + getCookie(label_token),
                "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
            },
            success : function(data){
                console.log(data);
                var datalist = document.getElementById(searchId).children[0];
                for(i=2; i<datalist.children.length && i<data.data.length; i++){
                    var opt = datalist.children[i];
                    opt.textContent = data.data[i].display_name;
                    opt.id = data.data[i].id;
                    //opt.value = data.data[i].display_name;
                }
            },
            error: function(err){
                console.log(err);
            }
        });
    }
}

function showAvatarWin(e){
    var avatarWin = document.getElementById("avatarWin");
    var tmpId = e.target.id;
    if(tmpId!=""){
        tmpId = tmpId.substring(tmpId.lastIndexOf("/")+1);
        console.log(tmpId);
        $.ajax({
            url : 'https://api.twitch.tv/helix/users?id='+tmpId,
            method: 'GET',
            headers: {
                "Authorization": " Bearer " + getCookie(label_token),
                "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
            },
            success : function(data){
                document.getElementById("avatarWin").src = data.data[0].profile_image_url;
                document.getElementById("winnerName").textContent = data.data[0].display_name;
                document.getElementById("winnerId").textContent = data.data[0].id;
                //opt.children[0].src = data.data[0].profile_image_url;
            },
            error: function(err){
                console.log(err);
                console.log('Failed channels');
            }
        });
        document.getElementById("btnValidWin").style.display="inline";
    }
    
}

function showAvatarLucky(e){
    var avatarWin = document.getElementById("avatarLucky");
    var tmpId = e.target.id;
    if(tmpId!=""){
        tmpId = tmpId.substring(tmpId.lastIndexOf("/")+1);
        console.log(tmpId);
        $.ajax({
            url : 'https://api.twitch.tv/helix/users?id='+tmpId,
            method: 'GET',
            headers: {
                "Authorization": " Bearer " + getCookie(label_token),
                "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
            },
            success : function(data){
                document.getElementById("avatarLucky").src = data.data[0].profile_image_url;
                document.getElementById("luckyName").textContent = data.data[0].display_name;
                document.getElementById("luckyId").textContent = data.data[0].id;
                //opt.children[0].src = data.data[0].profile_image_url;
            },
            error: function(err){
                console.log(err);
                console.log('Failed channels');
            }
        });
        document.getElementById("btnValidLucky").style.display="inline";
    }
    
}

function hideSearch(e){
    document.getElementById("myDropdownWinner").classList.remove("show");
    document.getElementById("myDropdownLucky").classList.remove("show");
}

function clearSearchWin(){
    document.getElementById("myDropdownWinner").classList.remove("show");
    document.getElementById("avatarWin").src="";
    document.getElementById("winnerName").textContent = "";
    document.getElementById("winnerId").textContent = "";
    document.getElementById("btnValidWin").style.display="none";
    document.getElementById("btnCancelWin").style.display="none";
    document.getElementById("newWinner").disabled = false;
}

function clearSearchLucky(){
    document.getElementById("myDropdownLucky").classList.remove("show");
    document.getElementById("avatarLucky").src="";
    document.getElementById("luckyName").textContent = "";
    document.getElementById("luckyId").textContent = "";
    document.getElementById("btnValidLucky").parentNode.style.display="none";
    document.getElementById("btnCancelLucky").parentNode.style.display="none";
    document.getElementById("give").disabled = false;
    document.getElementById("choice").disabled = false;
}

function cancelWinner(e){
    clearSearchWin();
}

function cancelLucky(e){
    clearSearchLucky();
}

function addWinner(e){
    $.ajax({
        url: 'Database/manageTickets.php?action=new&giver=' + getCookie(label_user) + "&token=" + getCookie(label_token) + "&lucky=" + document.getElementById("winnerId").textContent,
        method: 'POST',
        success : function(data){
            console.log(data);
            showTickets();
        },
        error: function(err){
            console.log(err);
        }
    });

    clearSearchWin();
}

function addLucky(e){
    $.ajax({
        url: 'Database/manageTickets.php?action=transfert&giver=' + getCookie(label_user) + "&token=" + getCookie(label_token) + "&lucky=" + document.getElementById("luckyId").textContent,
        method: 'POST',
        success : function(data){
            showTickets();
        },
        error: function(err){
            console.log(err);
        }
    });

    clearSearchLucky();
}

//Fonction pour ajouter une nouvelle clé
function addKey(e){
    e.target.style.display="none";
    document.getElementById("editKey").style.display="none";
    document.getElementById("cancelKey").style.display="inline";
    document.getElementById("saveKey").style.display="inline";
    document.getElementById("newInput").style.display="table-row";
    var actions = document.getElementsByClassName("action");
    for(let i = 0; i< actions.length; i++){
        actions[i].style.display="table-cell";
    }
    var actions = document.getElementsByClassName("action");
    for(let i = 0; i< actions.length; i++){
        if(actions[i].tagName.localeCompare("TD") == 0 && actions[i].parentNode.id.localeCompare("newInput") != 0){
            actions[i].style.display="none";
        }
    }
}

//Fonction pour annuler l'ajout d'une clé
function cancelAddKey(e){
    e.target.style.display="none";
    document.getElementById("addKey").style.display="inline";
    document.getElementById("editKey").style.display="inline";
    document.getElementById("saveKey").style.display="none";
    document.getElementById("newInput").style.display="none";
    var lastInputs = document.getElementsByClassName("lastInput");
    for(let i = 0; i< lastInputs.length; i++){
        lastInputs[i].remove();
    }
    var actions = document.getElementsByClassName("action");
    for(let i = 0; i< actions.length; i++){
        actions[i].style.display="none";
    }
}

//Fonction pour mettre à jour une clé
function editKey(e){
    var actions = document.getElementsByClassName("action");
    for(let i = 0; i< actions.length; i++){
        actions[i].style.display="table-cell";
        if(actions[i].tagName.localeCompare("TD") == 0 && actions[i].parentNode.id.localeCompare("newInput") != 0){
            var content = '<button class="inputAction w3-button w3-green" onClick="editInput(event)">Editer</button><button class="inputAction w3-button w3-red" onClick="clearInput(event)">Effacer</button>';
            actions[i].innerHTML = content.toString();
        }
    }
}

//Classe d'une nouvelle clé
class newInput {
    constructor(name, plateform, url, key, lutin) {
        this.name = name;
        this.plateform = plateform;
        this.url = url;
        this.key = key;
        this.lutin = lutin;
    }
}

//Fonction qui sauvegarde les nouvelles clés
function saveKey(e){
    e.target.style.display="none";
    document.getElementById("addKey").style.display="inline";
    document.getElementById("editKey").style.display="inline";
    document.getElementById("saveKey").style.display="none";
    document.getElementById("newInput").style.display="none";
    var lastInputs = document.getElementsByClassName("lastInput");
    var newInputs = [];
    for(let i = 0; i< lastInputs.length; i++){
        newInputs.push(new newInput(lastInputs[i].childNodes[0].textContent, lastInputs[i].childNodes[1].textContent, lastInputs[i].childNodes[2].textContent, lastInputs[i].childNodes[3].textContent,getCookie(label_user)));
    }
    var actions = document.getElementsByClassName("action");
    for(let i = 0; i< actions.length; i++){
        actions[i].style.display="none";
    }
    $(".lastInput").removeClass("lastInput");
    insertUrl = 'Database/manageSession.php?action=get&token='+getCookie(label_token)+'&idUser='+getCookie(label_user);
    $.ajax({
        method: 'POST',
        url: insertUrl,
        success:  function(data){
            
            for(let i = 0; i < newInputs.length; i++){
                $.ajax({
                    method: 'POST',
                    url: 'Database/crypto.php?action=encrypt&idUser='+getCookie(label_user)+'&msg='+newInputs[i].key+'&key='+data,
                    success:  function(data2){
                        console.log("entry find");
                            var insertUrl = 'Database/addKey.php?game=' + newInputs[i].name + '&plateform=' + newInputs[i].plateform + '&url=' + newInputs[i].url + '&keyCode=' + data2 + '&lutin=' + newInputs[i].lutin;
                            $.ajax({
                                method: 'POST',
                                url: insertUrl,
                                success:  function(data3){
                                    console.log("entries saved successfully");
                                },
                                error: function(err){
                                    console.log(err);
                                    console.log('Failed insert');
                                }
                            });
                    },
                    error: function(err){
                        console.log(err);
                        console.log('failed get');
                    }
                });
                
            }
        },
        error: function(err){
            console.log(err);
            console.log('failed get');
        }
    });
}


//Fonction pour se déconnecter et revenir à la page principale
function logout(e){
    $.ajax({
        url : 'https://id.twitch.tv/oauth2/revoke?client_id=okwwebdh0aua9s28aemjtdecybmj5c&token='+getCookie(label_token),
        method: 'POST',
        success : function(data){
            console.log("success logout");
            clearCookie();
            window.location.href="https://hotte2emenoel.000webhostapp.com/";
        },
        error: function(err){
            console.log(err);
            console.log('Failed logout');
        }
    });
}


//----------- Cookies --------------

/**
 * Fonction pour accéder aux cookies
 */
function getCookie(name){
    let decodedCookie = decodeURIComponent(document.cookie);
    let coo = decodedCookie.split(';');
    for(let i = 0; i<coo.length; i++){
        let c = coo[i];
        while (c.charAt(0) == ' '){
            c = c.substring(1);
        }
        if(c.indexOf(name + "=") == 0){
            return c.substring(name.length + 1, c.length);
        }
    }
    return "";
}

//Fonction pour supprimer les cookies
function clearCookie(){
    setCookie("exp", "", -1);
}

//Fonction pour ajouter un nouveau cookie
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Fonction pour la mise à jour des cookies avec le token et l'idUser.
 */
function updateCookies(){
    access_token = window.location.search;
    id_user = window.location.search;
    if(window.location.search.length>0){
        clearCookie();
        setCookie(label_token, access_token.substring(access_token.indexOf(label_token) + label_token.length+1, access_token.indexOf("&")), 1);
        setCookie(label_user, id_user.substring(id_user.indexOf(label_user) + label_user.length + 1), 1);
    }
}

//Fonction qui met en page les nouvelles clés
function addInput(e){
    var inputName = document.getElementById("inputName").childNodes[0].value;
    var inputPlateform = document.getElementById("inputPlateform").childNodes[0].value;
    var inputUrl = document.getElementById("inputUrl").childNodes[0].value;
    var inputKey = document.getElementById("inputKey").childNodes[0].value;
    if(inputName.length > 0  && inputPlateform.length > 0 && inputUrl.length > 0 && inputKey.length > 0){
        var tab = document.getElementById("gameKey");
        var row = tab.insertRow($("#gameKey tr").length - 1);
        var newName = row.insertCell(0);
        var newPlateform = row.insertCell(1);
        var newUrl = row.insertCell(2);
        var newKey = row.insertCell(3);
        var newAction = row.insertCell(4);
        newName.innerHTML = inputName;
        newPlateform.innerHTML = inputPlateform;
        newUrl.innerHTML = inputUrl;
        newKey.innerHTML = inputKey;
        newAction.innerHTML = '<button class="inputAction w3-button w3-red" onClick="deleteInput(event)">Effacer</button>';
        newAction.setAttribute("class", "action");
        row.setAttribute("class","lastInput");
        clearInput(e);
    }
}


//Fonction qui insère une nouvelle ligne dans la table
function insertRow(tableID, inputs, lastHidden=true, action=true){
    var tab = document.getElementById(tableID);
    var row;
    if(lastHidden){
       row = tab.insertRow($("#" + tableID + " tr").length - 1); 
    }else{
        row = tab.insertRow($("#" + tableID + " tr").length);
    }
    
    var tmpCell = "";
    for(let i= 0; i<inputs.length; i++){
        tmpCell = row.insertCell(i);
        tmpCell.innerHTML = inputs[i];
    }
    if(action){
        tmpCell = row.insertCell(inputs.length);
        tmpCell.setAttribute("class", "action");
    }
    
}

//Fonction qui supprime une ligne du tableau
function deleteInput(e){
    e.target.parentElement.parentElement.remove();
}

//Fonction qui supprime le contenu d'une ligne
function clearInput(e){
    document.getElementById("inputName").childNodes[0].value="";
    document.getElementById("inputPlateform").childNodes[0].value="";
    document.getElementById("inputUrl").childNodes[0].value="";
    document.getElementById("inputKey").childNodes[0].value="";
}

/**
 * Fonction qui récupère le pseudo et l'avatar
 */
function getPseudoAvatar(){
    $.ajax({
        url : 'https://api.twitch.tv/helix/users?id='+getCookie(label_user),
        method: 'GET',
        headers: {
            "Authorization": " Bearer " + getCookie(label_token),
            "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
        },
        success : function(data){
            document.innerHTML = data;
            console.log('Success channels:');
            var userData = data.data[0];
            document.getElementById('name_user').textContent=userData.display_name;
            document.getElementById('avatar').src=userData.profile_image_url;
        },
        error: function(err){
            console.log(err);
            console.log('Failed channels');
        }
    });
}

/**
 * Fonction pour mettre à jour le token
 */
function updateToken(){
    insertUrl = 'Database/manageSession.php?action=set&token='+getCookie(label_token)+'&idUser='+getCookie(label_user);
    $.ajax({
        method: 'POST',
        url: insertUrl,
        success:  function(data){
            console.log("entry find");
            console.log(data);
        },
        error: function(err){
            console.log(err);
            console.log('failed get');
        }
    });
}

function showGames(){
    document.getElementById("give").disabled = true;
    choiceGame = document.getElementById("gameChoice");
    choiceGame.style.display="block";
    choiceGame.style.width="100%";
    document.getElementById("choice").style.display="none";
    tabGame = document.getElementById("gamesTab");
    //retire le 0 mis par défaut
    tabGame.src = tabGame.src.substr(0,tabGame.src.length-1);
    tabGame.src = tabGame.src + getCookie(label_tickets);
    tabGame.src = tabGame.src + "&token=" + getCookie(label_token);
    tabGame.style.display="block";
    tabGame.style.width="100%";
}

/**
 * Fonction pour récupérer les clés offertes
 */
function ShowGivenKeys(){
    var selectUrl = 'Database/getKeys.php?action=given&lutin=' + getCookie(label_user);
    $.ajax({
        method: 'POST',
        url: selectUrl,
        success:  function(data){
            var select = data.split("},");
            var tab = document.getElementById("gameKey");
            
            //Identification du demandeur
            insertUrl = 'Database/manageSession.php?action=get&token='+getCookie(label_token)+'&idUser='+getCookie(label_user);
            $.ajax({
                method: 'POST',
                url: insertUrl,
                success:  function(data1){
                    
                    if(select.length == 1 && select[0] == "[]"){    //pas de clés offertes
                        document.getElementById("noKey").style.display="inline";
                    }else{                                          //clés offertes trouvées
                        document.getElementById("noKey").style.display="none";
                        
                        //Parcour des clés trouvées
                        for(let i = 0; i<select.length; i++){
                            var tmpEntry = select[i].split(",");

                            //Formattage des données trouvées
                            var tmpName = tmpEntry[1].split(":")[1].replaceAll('"',"").replaceAll("}","").replaceAll("]","");
                            var tmpKey = tmpEntry[0].split(":")[1].replaceAll('"',"").replaceAll("}","").replaceAll("]","");
                            var tmpPlate = tmpEntry[2].split(":")[1].replaceAll('"',"").replaceAll("}","").replaceAll("]","");
                            var tmpUrl = tmpEntry[3].split(":")[1].replaceAll('"',"").replaceAll("}","").replaceAll("]","");
                            var tmpStatus = tmpEntry[4].split(":")[1].replaceAll('"',"").replaceAll("}","").replaceAll("]","");
                            if(tmpStatus.localeCompare("0") == 0){
                                tmpStatus = "disponible";
                            }else{
                                tmpStatus = "gagnée";
                            }
                            
                            //Résolution de la clé
                            if(tmpEntry.length > 1){
                                $.ajax({
                                    method: 'POST',
                                    url: 'Database/crypto.php?action=decrypt&idUser='+getCookie(label_user)+'&msg='+tmpKey.replaceAll(" ","+")+'&key='+data1,
                                    success:  function(data2){
                                        var tmpArray = [];
                                        tmpArray.push(tmpName);
                                        tmpArray.push(tmpPlate);
                                        tmpArray.push(tmpUrl);
                                        tmpArray.push(data2);
                                        tmpArray.push(tmpStatus);
                                        insertRow("gameKey", tmpArray);
                                    },
                                    error: function(err){
                                        console.log(err);
                                        console.log('failed get');
                                    }
                                });
                            }
                       
                        }
                    }
                },
                error: function(err){
                    console.log(err);
                    console.log('failed get');
                }
            });
            
            //Cacher les boutons d'action
            var actions = document.getElementsByClassName("action");
            for(let i = 0; i< actions.length; i++){
                actions[i].style.display="none";
            }
        },
        error: function(err){
            console.log(err);
            console.log('Failed select');
        }
    });
}

function showTickets(){
    countTickets();
    listGiven();
}

function countTickets(){
    var selectUrl = 'Database/manageTickets.php?action=count&lucky=' + getCookie(label_user) + "&token=" + getCookie(label_token);
    var labTicket = document.getElementById("noTicket");
    $.ajax({
        method: 'POST',
        url: selectUrl,
        success:  function(data){
            if(data.indexOf(":")>0){
                data = data.split(":")[1].replaceAll('"','').replaceAll("}]","");
                console.log(data);
                console.log(data>0);
                if(data>0){
                    labTicket.style.display="none";
                    var countTickets = document.getElementById("nbTickets");
                    countTickets.textContent = "Encore " + data + " ticket(s) disponible(s)";
                    setCookie(label_tickets, data);
                    var parent = labTicket.parentNode;
                    parent.insertBefore(countTickets,labTicket);
                }else{
                   labTicket.style.display="inline";
                }
            }else{
               labTicket.style.display="inline";
            }
        },
        error: function(err){
            console.log(err);
            console.log('Failed select');
            labTicket.style.display="inline";
        }
    });
}

async function listGiven(){
    var selectUrl = 'Database/manageTickets.php?action=listGiven&giver=' + getCookie(label_user) + "&token=" + getCookie(label_token);
    $.ajax({
        method: 'POST',
        url: selectUrl,
        success:  function(data){
            if(data.indexOf(":")==-1){
                document.getElementById("noGiven").style.display="block";
            }else{
                var givTicket = document.getElementById("noGiven").style.display="none";
                var select = data.split("},");
                var tabGiven = document.getElementById("givenTickets");
                tabGiven.style.display = "block";
                console.log(select);
                clearTab("givenTickets", true, false);
                for (let i=0; i<select.length; i++){
                    var tmp = select[i].split(",");
                    createArrayNbGiven(tmp, function(){});
                }
            }
        },
        error: function(err){
            console.log(err);
            console.log('Failed select');
        }
    });
}

function createArrayNbGiven(input, callback){
    var lucky = input[0].split(":")[1];
    var nbTickets = input[1].split(":")[1];
    lucky = lucky.replaceAll('"','').replaceAll("}","").replaceAll("]","");
    nbTickets = nbTickets.replaceAll('"','').replaceAll("}","").replaceAll("]","");
    getDisplayName(lucky, function(name){
        var tmpArray = [];
        tmpArray.push(nbTickets);
        tmpArray.push(name);
        insertRow("givenTickets",tmpArray, false, false);
    });
    callback("success");
}

function getDisplayName(id, name){
    $.ajax({
        url : 'https://api.twitch.tv/helix/users?id='+id,
        method: 'GET',
        headers: {
            "Authorization": " Bearer " + getCookie(label_token),
            "Client-Id": " okwwebdh0aua9s28aemjtdecybmj5c"
        },
        success : function(data){
            console.log("id search");
            console.log(data.data[0]);
            var userData = data.data[0];
            name(userData.display_name);
        },
        error: function(err){
            console.log(err);
            name("ERROR");
        }
    });
}

function clearTab(id, head, body){
    var tab = document.getElementById(id);
    if(head){
        var thead = tab.children[0];
        for(i=thead.children.length-1; i>0; i--){
            console.log(thead.children[i]);
            console.log("avant: " + thead.children.length);
            thead.removeChild(thead.children[i]);
            console.log("après: " + thead.children.length);
        }
    }
    if (body){
        var tbody = tab.children[1];
        for(i=tbody.children.length-1; i>0; i--){
            tbody.removeChild(tbody.children[i]);
        }
    }
    
}

function saveChoice(e){
    console.log("save");
    showTickets();
    document.getElementById("gamesTab").src = 'games.html?action=saveChoice';
    document.getElementById("gameChoice").style.display="none";
    document.getElementById("choice").style.display="inline-block";
}

function cancelChoice(e){
    document.getElementById("gameChoice").style.display="none";
    document.getElementById("choice").style.display="inline-block";
}