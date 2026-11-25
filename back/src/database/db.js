// database/db.js: conexion a mysql, la importan todos los modelos
// mysql2/promise = version con promesas, asi usamos async/await en vez de callbacks
import mysql from "mysql2/promise";
import environments from "../config/environments.js";

const { database } = environments;

// pool de conexiones: mantiene hasta 10 conexiones abiertas y las va reutilizando.
// es mas eficiente que abrir y cerrar una conexion por cada request.
// uso normal: pool.query(sql, [valores]) (toma y suelta la conexion solo)
// uso en transaccion: pool.getConnection() para tener UNA conexion fija (ver sale.models.js)
const pool = mysql.createPool({
	host: database.host,
	user: database.user,
	password: database.password,
	database: database.name,
	waitForConnections: true, // si las 10 estan ocupadas, la peticion espera su turno
	connectionLimit: 10,
	decimalNumbers: true, // sin esto los DECIMAL (price) llegan como string
	dateStrings: true // las fechas llegan como string y no como objeto Date
});

export default pool;
