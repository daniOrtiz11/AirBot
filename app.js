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
var reserva_origen = "";
var reserva_destino = "";
var reserva_fecha = "";
var running = false;
var posiblevuelo;
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
        action = parser.parserFunction(verbs,entities);
    }
    controlAcciones(texto);
}

function controlAcciones(texto){
       if(action == 1){ //reserva
        if(entities.length > 0 && reserva_fecha == "" && (reserva_origen == "" || reserva_destino == "")){
            var textsplit = texto.split(" ");
            for(i = 0; i < entities.length; i++){
                var entact = entities[i];
                var ind = textsplit.indexOf(entact);
                var prepro = textsplit[ind-1];
                if(prepro == "to" && reserva_destino == "")
                    reserva_destino = entact;
                else if(prepro == "from" && reserva_origen == "")
                    reserva_origen = entact;
            }
            if(reserva_origen == "" && reserva_origen == ""){ //en caso de que no se haya encontrado ni origen ni destino
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
					//Introduzca usuario numero
					if(posiblevuelo.plazas > 2){ //Numero introducido por usuario
					
						//Preguntar si quiere vuelo de vuelta, antes de hacer la confirmación.
						bot.sendMessage(id, "We have enough tickes for you! Do you want to confirm the booking?");
						if(){ //Confirmación
							bd.confirmBooking(posiblevuelo,id, 2); //Vuelo y nº de plazas
							// Imprimir informe de reserva.
							// Preguntar si quiere un recordatorio de la reserva.
						} else { 
							bot.sendMessage(id, "What a pity! We will be waiting for your new booking!");
							//Hacer algo.
						}
					}					
				}
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
                    setTimeout(getkeys, 1000, texto);
                }
            }
        }
    }
    else{
        controlAcciones(texto);
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


init();
