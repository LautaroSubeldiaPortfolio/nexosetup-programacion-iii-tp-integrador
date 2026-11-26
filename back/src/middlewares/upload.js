// middlewares/upload.js: configuracion de multer (subida de imagenes de productos)
// por que multer: express.json() no sabe leer multipart/form-data (el tipo de body
// que usan los formularios con archivos). multer si: deja los campos de texto en req.body
// y el archivo en req.file
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { __dirname, join } from "../utils/index.js";

// las imagenes se guardan en public para que express las sirva como archivos estaticos
const carpetaImagenes = join(__dirname, "src/public/img/products");
// si la carpeta no existe la crea (recursive: no tira error si ya estaba)
fs.mkdirSync(carpetaImagenes, { recursive: true });

// diskStorage = guarda el archivo en disco (la alternativa es memoryStorage, en ram)
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, carpetaImagenes),
	filename: (req, file, cb) => {
		// nombre unico (fecha + numero al azar) para que dos archivos iguales no se pisen entre si
		// la extension la sacamos del nombre original
		const extension = path.extname(file.originalname).toLowerCase();
		cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`);
	}
});

const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// filtro: rechaza todo lo que no sea imagen (mira el mimetype que declara el archivo)
const fileFilter = (req, file, cb) => {
	if (!tiposPermitidos.includes(file.mimetype)) {
		const error = new Error("El archivo tiene que ser una imagen (jpg, png, webp o gif)");
		error.status = 400; // el errorHandler usa este status
		return cb(error);
	}
	cb(null, true);
};

// .single("image") = esperamos UN archivo en el campo "image"
// en el form el input file se tiene que llamar igual: name="image"
export const uploadImage = multer({
	storage,
	fileFilter,
	limits: { fileSize: 3 * 1024 * 1024 } // 3 mb, si se pasa tira LIMIT_FILE_SIZE (lo traduce el errorHandler)
}).single("image");
