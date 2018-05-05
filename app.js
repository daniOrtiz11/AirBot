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
var needwatson = true;
var reserva_origen = "";
var reserva_destino = "";
var reserva_fecha = "";
var reserva_plazas = 0;
var reserva_confirm = false;
var reserva_vuelo = false;
var running = false;
var isbooking = false;
var isconsulting = false;
var posiblevuelo = null;
var casoConsulta = -1;
//Mensajes predeterminados para salidas estandar
var helpmessages = ['Welcome to Airbot, your assistant 24/7 for flight reservations. What would you like to do?',
				'I hope we meet again soon. Have a nice day!',
				'Help message: type /start or /hello to start Airbot!',
                'Airbot is already running!',
                'Airbot is already running and you are booking a fligth!',
                'Airbot is already running and you are consulting your fligths!',
                'I hope we meet again soon. I have not saved your booking. Have a nice day!',
                'I hope we meet again soon. I have not saved your query. Have a nice day!',
                'You are booking a flight, but you can type whatever you want',
                'You are consulting your flights, but you can type whatever you want',
                'You can type whatever you want, I try to help you',
                'Can I do something else for you?',
                'Sorry, I could not understand you, could you repeat it?',
                'Ok, maybe the next time',
                'You can book and consult your flights'
				];

/*
situation = 1 ->type /running and running = true
situation = 2 ->type /goodbye 
situation = 3 ->type /help and running = true
*/
function parserHelp(situation){
    if(situation == 1){
        if(action == 1){
            bot.sendMessage(id, helpmessages[4]);    
        }
        else if(action == 2){
            bot.sendMessage(id, helpmessages[5]);
        }
        else{
            bot.sendMessage(id, helpmessages[3]);   
        }
    }
    else if(situation == 2){
        if(action == 1){
            bot.sendMessage(id, helpmessages[6]);
        }
        else if(action == 2){
            bot.sendMessage(id, helpmessages[7]);
        }
        else{
          bot.sendMessage(id, helpmessages[1]);   
        }
    }
    else if(situation == 3){
        if(action == 1){
            bot.sendMessage(id, helpmessages[8]);
        }
        else if(action == 2){
            bot.sendMessage(id, helpmessages[9]);
        }
        else{
            bot.sendMessage(id, helpmessages[10]);
        }
    }
}


function getkeys(texto){
   keywords = watson.getKeys();
    if (keywords != undefined){
        entities = parser.parserEntities(keywords.entities);
        verbs = parser.parserVerbs(keywords.semantic_roles);
        words = parser.parserWords(keywords.keywords);
        var oldaction = action;
        var newaction = parser.parserFunction(verbs,entities);
        if(newaction == oldaction && (isbooking || isconsulting)){
            action = newaction;
        }
        else if(newaction != -1){
            action = newaction;
            if(oldaction == 1 && newaction == 2){
                restartReserva();
            }
        }
    }
    if(action != -1)
        controlAcciones(texto);
    else{
        bot.sendMessage(id, helpmessages[12]);
        bot.sendMessage(id, helpmessages[14]);
    }
}

function controlAcciones(texto){
    if(action == 1){ //reserva
        isbooking = true;
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
                bot.sendMessage(id, helpmessages[12]);
                restartReserva();
                restart();
            }
            else if(reserva_origen != "" && reserva_destino == ""){
                bot.sendMessage(id, "Where do you want to travel?");
            }
            else if(reserva_destino != "" && reserva_origen == ""){
                bot.sendMessage(id, "Where do you want to start your trip?");
            }
        }
        if(reserva_destino != "" && reserva_origen != ""){
            if(reserva_vuelo == true && reserva_confirm == false && reserva_plazas > 0){
                var repeat = true;
                for(i = 0; i < textsplit.length; i++){
                    var act = textsplit[i];
                    var res = act.toLowerCase();
                    if(res == "yes"){
                        repeat = false;
                        reserva_confirm = true;
                    }
                    else if(res == "no"){
                        reserva_confirm = false;
                        repeat = false;
                    }
                }
                if(reserva_confirm == true){
                    bd.confirmBooking(posiblevuelo, id, reserva_plazas);
                    bot.sendMessage(id, "Your flight has been booked successfully!");
                    bot.sendMessage(id, helpmessages[11]);
                    restartReserva();
                    restart();
                }
                else if(reserva_confirm == false && repeat == false){
                    bot.sendMessage(id, helpmessages[13]);
                    bot.sendMessage(id, helpmessages[11]);
                    restartReserva();
                    restart();
                }
                else{
                    bot.sendMessage(id, helpmessages[12]);
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
                if(posiblevuelo.plazas > reserva_plazas && reserva_plazas > 0){ //Numero introducido por usuario
                        //Preguntar si quiere vuelo de vuelta, antes de hacer la confirmación.
                        bot.sendMessage(id, "I have enough tickes for you! Do you want to confirm the booking?");
                }
                else if(posiblevuelo.plazas <= reserva_plazas && reserva_plazas > 0){
                    bot.sendMessage(id, "Sorry I have not enough tickets for you... Try with another flight!");
                    reserva_plazas = 0;
                    bot.sendMessage(id,helpmessages[11]);
                    restartReserva();
                    restart();
                }
                else{
                    bot.sendMessage(id, helpmessages[12]);
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
                        needwatson = false;
                    }
                });
            }

        }
    } else if (action == 2){ //Consultas de vuelo o reserva
        /*
        1. caso: reserva
            1.1 id de reserva
            1.2 show de vuelo
        2. caso: vuelo
            2.1 id de vuelo
            2.2 show vuelo
        3. caso: reservas
            3.1 show todas
        4. caso: vuelos
            3.1 show todas
        5. default: repeat
        */
		isconsulting = true;
        var ok = false;
		var i = 0;
        if(casoConsulta == -1)
            casoConsulta = parser.parserConsulta(words);
        if(casoConsulta != -1){
           if(casoConsulta == 1){
               bot.sendMessage(id, "Of course. Could you write me your book's ID?");
           }
            else if(casoConsulta == 2){
                bot.sendMessage(id, "Of course. Could you write me your flight's ID?");
            }
            else if(casoConsulta == 3){
                bot.sendMessage(id, "Of course. These is yours books: ");
                var vuelos = bd.consultaReservasbyUser(id);
            }
            else if(casoConsulta == 4){
                bot.sendMessage(id, "Of course. These is yours flights: ");
				bd.consultReservasbyUser(id,function(err, result){ // result = booking
					if(err){
						bot.sendMessage(id,'There isn´t any booking with that ID');
					} else{
                        if(result.length > 0){
                            for (i = 0; i < result.length; i++){
                                var rw = result[i];
                                var ind = i+1;
                                var str = (rw.fecha.toString().split("00:00")[0]) + "at " + rw.hora;
                                bot.sendMessage(id,'This is your flight number '+ind+' \n'
										+ 'Flight from '+ rw.origen + ' to ' + rw.destino + '\n'
										+ 'Date: ' + str + '\n'
                                        + 'Tickets: ' + rw.npersonas + '\n'
										+ 'Price/ticket: ' + rw.precio);
                            }
                        }
                        else{
                            bot.sendMessage(id, "Sorry, you dont have fligths but I can help you!");
                        }
                        
					}
				});
            }
        }
        else{
            bot.sendMessage(id, helpmessages[13]);
            restartConsulta();
            restart();
        }
		/*while(i < words.length && !ok){
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
		}*/
	}
}
/*
Descripcion:
Parsear la conversación con el usuario y dirigir el comportamiento
*/
function parserMessages(){
    bot.on('text', (data) => {
    var texto = data.text;
    id = data.from.id;
    if(texto != "" && texto != null && texto != undefined){
        if(texto == "/start" || texto == "/hi" || texto == "/hello"){
            if(running == true){
               parserHelp(1);
            }
            else{
                bot.sendMessage(id, helpmessages[0]);
                running = true;
                bd.insertarUsuarioBD(id);   
            }
        }
        else if(texto == "/stop" || texto == "/bye" || texto == "/goodbye"){
            parserHelp(2);
            running = false;
        }
        else if(texto == "/help"){
            parserHelp(3);
        }
        else{
            if(running == false)
            bot.sendMessage(id, helpmessages[2]);
            else{
                watson.getKeyWatson(texto);
                setTimeout(getkeys, 1800, texto);
            }
        }
    }
});
}

function restart(){
    keywords = null;
    entities = null;
    verbs = null;
    words = null;
    id = null;
    action = -1;
    needwatson = true;
    isbooking = false;
    isconsulting = false;
    //bot.sendMessage(id, "Can I do something else for you?");
}

function restartReserva(){
    reserva_origen = "";
    reserva_destino = "";
    reserva_fecha = "";
    reserva_plazas = 0;
    reserva_confirm = false;
    reserva_vuelo = false;
    //var running = false;
    posiblevuelo = null;
    needwatson = true;
    isbooking = false;
}
function restartConsulta(){
    casoConsulta = -1;
}
/*
Descripcion: funcion de inicio que conecta con la base de datos, 
establece el comportamiento del bot y lo arranca.
*/
function init(){
    bd.startConnection();
    parserMessages();
    bot.start();
}

init();
