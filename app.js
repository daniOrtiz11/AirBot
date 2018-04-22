const TeleBot = require('telebot');
const bot = new TeleBot({
    token: '593194083:AAGUm1oWDfrgG5qhvuH5gvJk-Bn8toPNhm0',
    usePlugins: ['askUser', 'commandButton','namedButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});
var mysql = require('mysql');
var messages = ['Bienvenido a Airbot, su asistente 24/7 para realizar reservas de vuelo. ¿Qué desea hacer?',
				'Espero que nos volvamos a ver pronto. Ten un buen día.',
				'Ayuda'
				];
				
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

// Conexion con base de datos
var connection = mysql.createConnection({ 
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'airbot',
});
connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta con con base de datos.');
   }
});

//Consultas bd
function insertarUsuarioBD(id){
	
   connection.query('SELECT COUNT(*) as usersCount FROM usuarios WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   if(rows[0].usersCount < 1){
			    connection.query('INSERT INTO usuarios(id) VALUES(?)', [id], function(error, result){
				   if(error){
					  throw error;
				   }else{
					  console.log('ID introducido correctamente.');
				   }
			})
		   } else{
			   console.log('El ID ya está dado de alta en la BD.');
		   }
	   }
   });
}

function consultaVuelo(id){
	console.log("aaa");
	connection.query('SELECT * FROM vuelos WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   return rows[0];
	   }
	});
}

function consultaReserva(id){
	
	connection.query('SELECT * FROM reservas WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   return rows[0];
	   }
	});
}

bot.start();