// config/environments.js: junta todas las variables de entorno en un solo objeto
// por que: los datos sensibles (clave de la bd, clave de sesion) NO van escritos en el codigo,
// van en el .env, que esta en el .gitignore y nunca se sube al repo (se sube el .env.example)
import dotenv from "dotenv";

dotenv.config(); // lee el archivo .env y deja todo en process.env

export default {
	port: process.env.PORT || 3000, // si no hay PORT en el .env usa 3000
	session_key: process.env.SESSION_KEY, // secreto con el que se firma la cookie de sesion
	front_url: process.env.FRONT_URL || "http://localhost:5500", // para el boton "ver tienda" del panel
	database: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		name: process.env.DB_NAME
	}
};
