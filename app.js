const TeleBot = require('telebot');
const watson =require('./watson');
const bd = require('./ourbd');
const bot = new TeleBot({
    token: '593194083:AAGUm1oWDfrgG5qhvuH5gvJk-Bn8toPNhm0',
    usePlugins: ['askUser', 'commandButton','namedButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});
var keywords;
var messages = ['Bienvenido a Airbot, su asistente 24/7 para realizar reservas de vuelo. ¿Qué desea hacer?',
				'Espero que nos volvamos a ver pronto. Ten un buen día.',
				'Ayuda'
				];

function init(){
    configurationBotInit();
    bot.start();
}

function getkeys(){
   keywords = watson.getKeys();
    console.log(keywords);
}

function configurationBotInit(){
    //Funcion para llamar a watson
    watson.getKeyWatson("I want book a flight to Madrid");
    //funcion para ir a por el valor de las keywords despues de la llamada a la api
    setTimeout(getkeys, 1000);
    
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


