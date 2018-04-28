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
var running = false;
var messages = ['Bienvenido a Airbot, su asistente 24/7 para realizar reservas de vuelo. ¿Qué desea hacer?',
				'Espero que nos volvamos a ver pronto. Ten un buen día.',
				'Mensaje de ayuda: escriba /start o /hola para empezar Airbot!'
				];

function init(){
    //configurationBotInit();
    parserMessages();
    bot.start();
}

function getkeys(id){
   keywords = watson.getKeys();
    if (keywords != undefined){
        var entities = parser.parserEntities(keywords.entities);
        var verbs = parser.parserVerbs(keywords.semantic_roles);
        var words = parser.parserWords(keywords.keywords);
        bot.sendMessage(id, 'WE ARE VENOM AND WE ARE PARSER YOUR TEXT!');
        console.log("ENTITIES:");
        console.log(entities);
        //console.log(keywords.entities);
         console.log("KEYWORDS:");
        console.log(words);
         console.log("VERBS:");
        console.log(verbs);
        //console.log(JSON.stringify(keywords.semantic_roles));
    }
}

function parserMessages(){
    bot.on('text', (data) => {
    var texto = data.text;
    var id = data.from.id;
    if(texto != "" && texto != null && texto != undefined){
        if(texto == "/start" || texto == "/hola"){
            bot.sendMessage(id, messages[0]);
            running = true;
        }
        else if(texto == "/stop" || texto == "/adios"){
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
    //Funcion para llamar a watson
    //watson.getKeyWatson("I want book a flight to Madrid");
    //funcion para ir a por el valor de las keywords despues de la llamada a la api
    //setTimeout(getkeys, 1000);
    
    //bd.startConnection();
    //Manejo de eventos
    //Mensaje de bienvenida, también funciona con start.
    //En msg.from.id tenemos el ID de cada cliente que entra al chat, para poder guardarlo en la base de datos.
    bot.on(['/start', '/hola'], (msg) => (msg.reply.text(messages[0]) && insertarUsuarioBD(msg.from.id)));
    //Mensaje de despedida, también funciona con stop.
    bot.on(['/stop', '/adios'], (msg) => msg.reply.text(messages[1]));
    //Sección de ayuda de comandos.
    bot.on(['/help', '/ayuda'], (msg) => msg.reply.text(messages[2]));
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


