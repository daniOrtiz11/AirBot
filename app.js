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
var id;
var running = false;
var messages = ['Welcome to Airbot, your assistant 24/7 for flight reservations. What would you like to do?',
				'I hope we meet again soon. Have a nice day.',
				'Help message: type /start or /hello to start Airbot!'
				];

function init(){
    //configurationBotInit();
    bd.startConnection();
    parserMessages();
    bot.start();
}

function getkeys(id){
   keywords = watson.getKeys();
    if (keywords != undefined){
        var entities = parser.parserEntities(keywords.entities);
        var verbs = parser.parserVerbs(keywords.semantic_roles);
        var words = parser.parserWords(keywords.keywords);
        var action = parser.parserFunction(verbs,entities);
        if(action != -1){
            bot.sendMessage(id, "You want to book a flight");
        }
        else{
            bot.sendMessage(id, "Sorry, I could not understand you, could you repeat it?")
        }
    }
}

function parserMessages(){
    bot.on('text', (data) => {
    var texto = data.text;
    id = data.from.id;
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
                setTimeout(getkeys, 1000, id);
            }
        }
        
       
        
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
                bot.inlineButton('Vuelo', {callback: 'consultaVuelo("1")'})
            ],
            [
                bot.inlineButton('Reserva', {callback: 'consultaReserva("1")'})
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


