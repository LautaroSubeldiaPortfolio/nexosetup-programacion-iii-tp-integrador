// middlewares/middlewares.js: middlewares generales (no son de una sola ruta)
// un middleware es una funcion (req, res, next) que se mete en el medio de la peticion:
// puede mirar/modificar req y res, y despues tiene que hacer una de dos cosas:
//   - llamar a next() -> sigue al proximo middleware o al controlador
//   - responder (res.json / res.redirect / ...) -> corta ahi la cadena

// logger: muestra por consola cada peticion que le pega al servidor
export const loggerUrl = (req, res, next) => {
	console.log(`[${new Date().toLocaleString("es-AR")}] ${req.method} ${req.url}`);
	next(); // sin el next() la peticion queda colgada para siempre
};

// protege las vistas del panel (las que devuelven html)
// si no hay usuario guardado en la sesion, mandamos al login
export const requireLogin = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect("/login");
	}
	next();
};

// lo mismo pero para endpoints de la api, ahi no redirigimos, devolvemos 401 en json
// 401 = no autenticado (no sabemos quien sos)
export const requireLoginApi = (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).json({ message: "Tenés que iniciar sesión como administrador" });
	}
	next();
};

// si llegamos hasta aca es que ninguna ruta atendio la peticion -> 404
export const notFound = (req, res) => {
	if (req.originalUrl.startsWith("/api")) {
		return res.status(404).json({ message: "Endpoint no encontrado" });
	}
	res.status(404).send("Página no encontrada");
};

// manejador de errores central: express lo reconoce como "de errores" porque tiene 4 parametros
// (err primero). los controladores async hacen next(error) y todo termina aca,
// asi no repetimos try/catch con respuestas en cada archivo
export const errorHandler = (err, req, res, next) => {
	// si ya se mando parte de la respuesta no podemos mandar otra, se la pasamos a express
	if (res.headersSent) {
		return next(err);
	}

	let status = err.status || 500;
	let message = err.message;

	// errores de multer (la libreria que sube archivos)
	if (err.code === "LIMIT_FILE_SIZE") {
		status = 400;
		message = "La imagen pesa más de 3 MB";
	}
	// errores de mysql, vienen con un code que podemos traducir a un status http
	else if (err.code === "ER_DUP_ENTRY") {
		// violacion de unique (ej: email repetido) -> 409 conflict
		status = 409;
		message = "Ya existe un registro con esos datos";
	} else if (err.code === "ER_NO_REFERENCED_ROW_2") {
		// foreign key que apunta a algo que no existe (ej: category_id inexistente)
		status = 400;
		message = "La categoría indicada no existe";
	}

	// los 500 no mostramos detalles internos al cliente (por seguridad), solo los logueamos
	if (status === 500) {
		console.error(err);
		message = "Error interno del servidor";
	}

	// api -> json, vistas -> texto
	if (req.originalUrl.startsWith("/api")) {
		return res.status(status).json({ message });
	}
	res.status(status).send(message);
};
