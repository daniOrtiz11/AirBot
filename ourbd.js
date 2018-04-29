// Conexion con base de datos
var mysql = require('mysql');
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

function consultaVuelo(id){
	connection.query('SELECT * FROM vuelos WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   return rows[0];
	   }
	});
}

function consultaVueloByOrigenDestino(origen,destino){
    var f = new Date();
    var today = f.getDate() + "-" + (f.getMonth() +1) + "-" + f.getFullYear() + " 23:59";   
	connection.query('SELECT * FROM vuelos WHERE origen=? and destino=? and fecha > ? and plazas > 0', [origen,destino,today],function(err, rows, fields){
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

exports.consultaVueloByOrigenDestino=consultaVueloByOrigenDestino;
exports.connection=connection;
exports.startConnection=startConnection;
exports.insertarUsuarioBD=insertarUsuarioBD;