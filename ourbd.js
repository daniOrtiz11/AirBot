// Conexion con base de datos
var mysql = require('mysql');
var i = 0;
var connection = mysql.createConnection({ 
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'airbot',
});

function startConnection(){
    connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta con con base de datos');
   }
});
}


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

var flight = function consultaVueloByOrigenDestino(origen,destino,callback){
    var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	
	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 
	today = yyyy+'/'+mm+'/'+dd;
	
	connection.query('SELECT * FROM vuelos WHERE origen=? and destino=? and fecha>? and plazas > 0', [origen,destino,today],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		  callback(null, rows[0]);
	   }
	});
}

function confirmBooking(vuelo, idUser, nTickets){
	var hora = new Date();
	hora = hora.getHours()+":"+hora.getMinutes();
	
	//Insert en reservas
	connection.query('INSERT INTO reservas(id,idvueloida,idvueloretorno,idusuario,fechareserva,horareserva,npersonas,expirado)'+
					 'VALUES(?,?,?,?,?,?,?,?)', [null,vuelo.id,null,idUser,vuelo.fecha,hora,nTickets,0], function(error, result){
		if(error){
			throw error;
		}else{
			nPlazas = vuelo.plazas - 1;
			connection.query('UPDATE vuelos SET plazas=? WHERE id=?',[nPlazas,vuelo.id], function(error, result){
				if(error){
					  throw error;
				   }else{
					  console.log('Actualizado nº de plazas del vuelo ' + vuelo.id);
				   }
			});
			console.log('Reserva realizada correctamente.');
		}
	})
}

var consultFlight = function consultaVuelo(id,callback){
	connection.query('SELECT * FROM vuelos WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		    callback(null, rows[0]);
	   }
	});
}

var consultBooking = function consultaReserva(id,callback){
	
	connection.query('SELECT * FROM reservas WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   callback(null, rows[0]);
	   }
	});
}

var consultReservasbyUser = function queryReservasbyUser(id, callback){
   connection.query('SELECT r.npersonas, v.origen, v.destino, v.fecha, v.hora, v.precio FROM `reservas` as r INNER JOIN `vuelos` as v on v.id = r.idvueloida WHERE idusuario=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
            callback(null, rows);
	   }
   });
}

//exports.consultaVueloByOrigenDestino=consultaVueloByOrigenDestino;
exports.connection=connection;
exports.startConnection=startConnection;
exports.insertarUsuarioBD=insertarUsuarioBD;
exports.consultFlight=consultFlight;
exports.consultBooking=consultBooking;
exports.confirmBooking=confirmBooking;
exports.flight = flight;
exports.consultReservasbyUser=consultReservasbyUser;