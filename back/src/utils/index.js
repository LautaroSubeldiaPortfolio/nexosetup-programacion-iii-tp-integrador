// utils/index.js: funciones chicas que usan varios archivos
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// en esm no existe __dirname (en commonjs si), hay que armarlo a mano:
// import.meta.url es la url del archivo actual (file:///...), fileURLToPath la pasa a ruta normal
const __filename = fileURLToPath(import.meta.url);
// estamos en src/utils, subimos dos niveles para llegar a la raiz del back
const __dirname = resolve(dirname(__filename), "../../");

export { __dirname, join };

// fecha en hora argentina con formato de mysql (yyyy-mm-dd hh:mm:ss)
// por que no new Date() directo: el servidor puede estar en otra zona horaria (utc)
// y la venta se guardaria con la hora equivocada.
// usamos sv-SE porque ese locale ya devuelve el formato iso (año-mes-dia hora:min:seg)
export const fechaArgentina = () => {
	const fecha = new Intl.DateTimeFormat("sv-SE", {
		timeZone: "America/Argentina/Buenos_Aires",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23" // hora de 0 a 23 (sin esto a medianoche puede salir "24")
	}).format(new Date());

	return fecha.slice(0, 19);
};

// numero de ticket con ceros a la izquierda: 123 -> "000123"
// padStart(6, "0") rellena con ceros hasta que el string tenga 6 caracteres
export const numeroTicket = (id) => String(id).padStart(6, "0");
