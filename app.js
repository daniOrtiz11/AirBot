const TeleBot = require('telebot');
const watson =require('./watson');
const bd = require('./ourbd');
const parser = require('./parser');
const bot = new TeleBot({
    token: '593194083:AAGUm1oWDfrgG5qhvuH5gvJk-Bn8toPNhm0',
    usePlugins: ['askUser', 'commandButton','namedButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});
var keywords;
var entities;
var verbs;
var words;
var id;
var action = -1;
var dowatson = true;
var reserva_origen = "";
var reserva_destino = "";
var reserva_fecha = "";
var reserva_plazas = 0;
var reserva_confirm = false;
var reserva_vuelo = false;
var running = false;
var posiblevuelo = null;
var messages = ['Welcome to Airbot, your assistant 24/7 for flight reservations. What would you like to do?',
				'I hope we meet again soon. Have a nice day.',
				'Help message: type /start or /hello to start Airbot!'
				];

function init(){
    //configurationBotInit();
    bd.startConnection();
    parserMessages();
    bot.start();
    var f = new Date();
}

function getkeys(texto){
   keywords = watson.getKeys();
    if (keywords != undefined){
        entities = parser.parserEntities(keywords.entities);
        verbs = parser.parserVerbs(keywords.semantic_roles);
        words = parser.parserWords(keywords.keywords);
        if(action == -1)
        action = parser.parserFunction(verbs,entities);
    }
    else{
        console.log("Watson Problem");
    }
    controlAcciones(texto);
}

function controlAcciones(texto){
    if(action == 1){ //reserva
        var textsplit = texto.split(" ");
        if(entities.length > 0 && reserva_fecha == "" && (reserva_origen == "" || reserva_destino == "")){
            for(i = 0; i < entities.length; i++){
                var entact = entities[i];
                var ind = textsplit.indexOf(entact);
                var prepro = textsplit[ind-1];
                if(prepro == "to" && reserva_destino == "")
                    reserva_destino = entact;
                else if(prepro == "from" && reserva_origen == "")
                    reserva_origen = entact;
            }
            if(reserva_origen == "" && reserva_destino == ""){ //en caso de que no se haya encontrado ni origen ni destino
                bot.sendMessage(id, "Sorry, I could not understand you, could you repeat it?");
                action = -1;
            }
            else if(reserva_origen != "" && reserva_destino == ""){
                bot.sendMessage(id, "Where do you want to travel?");
            }
            else if(reserva_destino != "" && reserva_origen == ""){
                bot.sendMessage(id, "Where do you want to start your trip?");
            }
        }
        if(reserva_destino != "" && reserva_origen != ""){
            if(reserva_vuelo == true && reserva_confirm == true){
                
            }
            else if(reserva_vuelo == true && reserva_confirm == false && reserva_plazas != 0){
                for(i = 0; i < textsplit.length; i++){
                    var act = textsplit[i];
                    var res = act.toLowerCase();
                    if(res == "yes")
                        reserva_confirm = true;
                    else
                        reserva_confirm = false;
                }
                if(reserva_confirm == true){
                    bot.sendMessage(id, "Your flight has been booked successfully!");
                    bd.confirmBooking(reserva_vuelo, id, reserva_plazas);
                    restart();
                }
                else{
                    bot.sendMessage(id, "Ok, maybe the next time");
                    restart();
                }
            }
            else if(reserva_vuelo == true && reserva_confirm == false && reserva_plazas == 0){
                for(i = 0; i <textsplit.length; i++){
                    var act = textsplit[i];
                    var a = parseInt(act);
                    if(Number.isInteger(a)){
                         reserva_plazas = a;
                        
                    }
                }
                if(posiblevuelo.plazas > reserva_plazas){ //Numero introducido por usuario
                        //Preguntar si quiere vuelo de vuelta, antes de hacer la confirmación.
                        bot.sendMessage(id, "I have enough tickes for you! Do you want to confirm the booking?");
                }
                else{
                    bot.sendMessage(id, "Sorry I have not enough tickets for you... Try with another flight!");
                }
            }
            else if(reserva_vuelo == false && reserva_confirm == false){
                bd.flight(reserva_origen, reserva_destino,function(err, result){
                    posiblevuelo = result;
                     if(posiblevuelo == undefined){
                    bot.sendMessage(id, "Sorry, I could not find a flight to you, you could try again with others destinations");
                    action = -1;
                    }
                    else{
                        var str = (posiblevuelo.fecha.toString().split("00:00")[0]) + "at " + posiblevuelo.hora;
                        bot.sendMessage(id, "I have found a flight to you on the date: " + str);
                        bot.sendMessage(id, "The ticket's price is "+ posiblevuelo.precio + "€ ¿How many tickets do you want? ");
                        reserva_vuelo = true;
                        dowatson = false;
                    }
                });
            }

        }
    } else if (action == 2){ //Consultas de vuelo o reserva
		var ok = false;
		var i = 0;
		while(i < words.length && !ok){
			if(words[i] == 'flight' || words[i] == 'booking') ok = true;
			else i++;
		}
		if(words[i] == 'flight'){
			bot.sendMessage(id, "Of course. Could you write me yours flight's ID?");
			action = -2;
			bot.on('text', (data) => {
				var idF = data.text;
				bd.consultFlight(idF,function(err, result){ // result = flight
					if(err){
						bot.sendMessage(id,'There isn´t any flight with that ID');
					} else {
						var str = (result.fecha.toString().split("00:00")[0]) + "at " + result.hora;
						bot.sendMessage(id,'This is your flight \n'
										+ 'Flight from '+ result.origen + ' to ' + result.destino + '\n'
										+ 'Date: ' + str + '\n'
										+ 'Price: ' + result.precio);
					}
				});
			});
		} else if(words[i] == 'booking'){
			bot.sendMessage(id, "Of course. Could you write me yours booking's ID?");
			action = -2;
			bot.on('text', (data) => {
				var idB = data.text;
				bd.consultBooking(idB,function(err, result){ // result = booking
					if(err){
						bot.sendMessage(id,'There isn´t any booking with that ID');
					} else{
						bot.sendMessage(id,'This is your booking \n'
										+ 'ID Flight: '+ result.idvueloida + '\n'
										+ 'Date of issue: ' + result.fechareserva + '\n'
										+ 'Number of passengers: ' + result.npersonas);
					}
				});
			});
		}
	}
}
function parserMessages(){
    bot.on('text', (data) => {
    var texto = data.text;
    id = data.from.id;
    if(action == -1){
        if(texto != "" && texto != null && texto != undefined){
            if(texto == "/start" || texto == "/hi" || texto == "/hello"){
                bot.sendMessage(id, messages[0]);
                running = true;
                bd.insertarUsuarioBD(id);
            }
            else if(texto == "/stop" || texto == "/bye" || texto == "/goodbye"){
                bot.sendMessage(id, messages[1]);
                running = false;
            }
            else{
                if(running == false)
                bot.sendMessage(id, messages[2]);
                else{
                    watson.getKeyWatson(texto);
                    setTimeout(getkeys, 2000, texto);
                }
            }
        }
    }
    else{
		if(action != -2){
            if(dowatson == true){
            watson.getKeyWatson(texto);
			setTimeout(getkeys, 2000, texto);
            }
            else
               controlAcciones(texto);  
		}
        else{
           controlAcciones(texto); 
        }
        //controlAcciones(texto);
    }
});
}

function configurationBotInit(){
    //Inicio del proceso de reserva
    bot.on(['/booking', '/reserva'], (msg) => "");
    //Consulta sobre un vuelo o reserva.
    bot.on(['/query', '/consulta'], (msg) => {

        const replyMarkup = bot.inlineKeyboard([
            [
                bot.inlineButton('Vuelo', {callback: db.consultaVuelo("1")})
            ],
            [
                bot.inlineButton('Reserva', {callback: db.consultaReserva("1")})
            ]
        ]);
        return bot.sendMessage(msg.from.id, 'Sobre que desea realizar la consulta, ¿sobre un vuelo o una reserva?', {replyMarkup});
    });
    
    //Consultar/modificar recordatorio
    bot.on(['/reminder', '/recordatorio'], (msg) => "");
    //Pedir recomendaciones
    bot.on(['/recommendation', '/recomendacion'], (msg) => "");
}

function restart(){
    keywords = null;
    entities = null;
    verbs = null;
    words = null;
    id = null;
    action = -1;
    dowatson = true;
    reserva_origen = "";
    reserva_destino = "";
    reserva_fecha = "";
    reserva_plazas = 0;
    reserva_confirm = false;
    reserva_vuelo = false;
    //var running = false;
    posiblevuelo = null;
    parserMessages();
}

init();
