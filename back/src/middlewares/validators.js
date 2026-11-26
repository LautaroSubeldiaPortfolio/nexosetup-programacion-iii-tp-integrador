// middlewares/validators.js: validaciones de lo que manda el cliente
// regla de oro: NUNCA confiar en lo que viene del front. el front valida por comodidad,
// pero cualquiera puede pegarle a la api con curl/postman, asi que el back valida SIEMPRE.
// si algo esta mal -> 400 con el listado de errores; si esta bien -> next() y sigue al controlador
import fs from "node:fs";

// helpers chiquitos para no repetir
// texto valido: es string y su largo (sin espacios de los costados) esta entre min y max
const textoValido = (valor, min, max) => {
	return typeof valor === "string" && valor.trim().length >= min && valor.trim().length <= max;
};

// llega todo como string (params, query), por eso lo pasamos a Number y chequeamos que sea entero > 0
const enteroPositivo = (valor) => {
	const n = Number(valor);
	return Number.isInteger(n) && n > 0;
};

// si multer ya guardo la imagen y despues falla la validacion, la borramos para no dejar basura en disco
const borrarImagenSubida = (req) => {
	if (req.file) {
		fs.unlink(req.file.path, () => {});
	}
};

// formato unico de respuesta para datos invalidos: { message, errors: [...] }
// 400 = bad request (la culpa es del cliente)
const respuestaInvalida = (res, errors) => {
	return res.status(400).json({ message: "Datos inválidos", errors });
};

// ---- id en la url (/api/products/:id)
// ojo: sirve tambien contra sql injection porque garantiza que el id es un numero
export const validateId = (req, res, next) => {
	if (!enteroPositivo(req.params.id)) {
		return res.status(400).json({ message: "El id tiene que ser un número entero positivo" });
	}
	req.params.id = Number(req.params.id); // lo dejamos como numero para el controlador
	next();
};

// ---- query string del listado: ?category=1&page=1&limit=6
export const validateListQuery = (req, res, next) => {
	// valores por defecto: pagina 1 y 6 productos por pagina
	const { category, page = "1", limit = "6" } = req.query;
	const errors = [];

	if (!enteroPositivo(page)) errors.push("page tiene que ser un entero mayor a 0");
	// tope de 50 para que nadie pida la tabla entera de una
	if (!enteroPositivo(limit) || Number(limit) > 50) errors.push("limit tiene que ser un entero entre 1 y 50");
	if (category !== undefined && !enteroPositivo(category)) errors.push("category tiene que ser un id válido");

	if (errors.length > 0) {
		return respuestaInvalida(res, errors);
	}

	// dejamos los datos ya listos en la req para el controlador
	// offset = cuantos registros saltear (pagina 2 con limit 6 -> saltea 6)
	req.listParams = {
		page: Number(page),
		limit: Number(limit),
		offset: (Number(page) - 1) * Number(limit),
		categoryId: category ? Number(category) : null
	};
	next();
};

// ---- alta y modificacion de producto (llega como multipart/form-data)
// ojo: este middleware va DESPUES de uploadImage, porque sin multer req.body viene vacio
export const validateProductBody = (req, res, next) => {
	const { name, variant, description, price, category_id } = req.body;
	const errors = []; // juntamos todos los errores y los devolvemos juntos

	if (!textoValido(name, 2, 80)) errors.push("El nombre es obligatorio (entre 2 y 80 caracteres)");
	if (variant && !textoValido(variant, 1, 80)) errors.push("La variante no puede pasar los 80 caracteres");
	if (description && !textoValido(description, 1, 300)) errors.push("La descripción no puede pasar los 300 caracteres");
	if (!(Number(price) > 0) || Number(price) > 10000000) errors.push("El precio tiene que ser un número mayor a 0");
	if (!enteroPositivo(category_id)) errors.push("Tenés que elegir una categoría");

	if (errors.length > 0) {
		borrarImagenSubida(req);
		return respuestaInvalida(res, errors);
	}

	// dejamos el body limpio y con los tipos correctos (multipart manda todo como texto)
	// asi el controlador recibe solo los campos esperados (ignora cualquier campo de mas)
	req.body = {
		name: name.trim(),
		variant: variant ? variant.trim() : null,
		description: description ? description.trim() : null,
		price: Number(price),
		category_id: Number(category_id)
	};
	next();
};

// ---- venta: { customer_name, items: [{ product_id, quantity }] }
// ojo: el front NO manda el precio, el back lo lee de la bd (si no, alguien podria mandar precio 1)
export const validateSaleBody = (req, res, next) => {
	const { customer_name, items } = req.body;
	const errors = [];

	if (!textoValido(customer_name, 1, 40)) errors.push("El nombre del cliente es obligatorio (máximo 40 caracteres)");

	if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
		errors.push("La compra tiene que tener entre 1 y 50 productos");
	} else {
		// recorremos cada item para validar product_id y cantidad (el ?. evita romper si el item es null)
		items.forEach((item, i) => {
			if (!enteroPositivo(item?.product_id)) errors.push(`items[${i}]: product_id inválido`);
			if (!enteroPositivo(item?.quantity) || Number(item.quantity) > 99) {
				errors.push(`items[${i}]: la cantidad tiene que ser un entero entre 1 y 99`);
			}
		});
	}

	if (errors.length > 0) {
		return respuestaInvalida(res, errors);
	}
	next();
};

// ---- alta de usuario admin
export const validateUserBody = (req, res, next) => {
	const { name, email, password } = req.body;
	const errors = [];

	if (!textoValido(name, 2, 60)) errors.push("El nombre es obligatorio (entre 2 y 60 caracteres)");
	// regex simple de email: algo @ algo . algo, sin espacios
	if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
		errors.push("El email no es válido");
	}
	// bcrypt solo mira los primeros 72 bytes, por eso el maximo
	if (typeof password !== "string" || password.length < 8 || password.length > 72) {
		errors.push("La contraseña tiene que tener entre 8 y 72 caracteres");
	}

	if (errors.length > 0) {
		return respuestaInvalida(res, errors);
	}
	next();
};

// ---- login (llega del form html, por eso si falla renderizamos la vista y no json)
export const validateLoginBody = (req, res, next) => {
	const { email, password } = req.body;

	if (typeof email !== "string" || email.trim() === "" || typeof password !== "string" || password === "") {
		return res.status(400).render("login", { title: "Login", error: "Completá el email y la contraseña" });
	}
	next();
};
