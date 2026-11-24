-- nexosetup: base de datos completa + productos de prueba
-- se puede correr las veces que quieras, borra todo y arranca de cero
-- correr con: sudo mysql < database/schema.sql

-- importante para que los acentos se guarden bien
set names utf8mb4;

drop database if exists nexosetup;
create database nexosetup character set utf8mb4 collate utf8mb4_unicode_ci;
use nexosetup;

-- usuarios admin (el password se guarda hasheado con bcrypt, nunca en texto plano)
create table users (
	id int unsigned auto_increment primary key,
	name varchar(60) not null,
	email varchar(100) not null unique,
	password varchar(100) not null,
	is_admin tinyint(1) not null default 1,
	created_at datetime not null default current_timestamp
);

-- las dos categorias de productos
-- relacion 1 a muchos: una categoria tiene muchos productos (products.category_id apunta aca)
create table categories (
	id int unsigned auto_increment primary key,
	name varchar(60) not null
);

-- active = 0 es baja logica, el producto sigue en la bd pero el cliente no lo ve
create table products (
	id int unsigned auto_increment primary key,
	category_id int unsigned not null,
	name varchar(80) not null,
	variant varchar(80) default null,
	description varchar(300) default null,
	price decimal(10,2) not null,
	image varchar(255) not null default '/img/placeholder.svg',
	active tinyint(1) not null default 1,
	created_at datetime not null default current_timestamp,
	-- foreign key: mysql no deja guardar un producto con una categoria que no existe
	foreign key (category_id) references categories(id)
);

-- cabecera de la venta: quien compro, cuando y el total (los productos estan en product_sales)
create table sales (
	id int unsigned auto_increment primary key,
	user_name varchar(40) not null,
	date datetime not null,
	total_price decimal(12,2) not null
);

-- tabla intermedia, relacion muchos a muchos entre products y sales
-- guardo unit_price para que si despues cambia el precio no se rompa el historial
create table product_sales (
	sale_id int unsigned not null,
	product_id int unsigned not null,
	quantity int unsigned not null default 1,
	unit_price decimal(10,2) not null,
	-- clave primaria compuesta: un mismo producto no puede repetirse dentro de la misma venta (se suman las cantidades)
	primary key (sale_id, product_id),
	foreign key (sale_id) references sales(id),
	foreign key (product_id) references products(id)
);

insert into categories (name) values ('Periféricos'), ('Componentes y accesorios');

-- categoria 1: perifericos
insert into products (category_id, name, variant, description, price, image, active) values
(1, 'Teclado Mecánico TKL', 'Switch Red, negro', 'Formato TKL sin teclado numérico, switches lineales y retroiluminación.', 85000, '/img/products/teclado-mecanico-tkl.jpg', 1),
(1, 'Teclado Mecánico 60%', 'Switch Brown, blanco', 'Compacto al 60%, switches táctiles, ideal para escritorios chicos.', 78000, '/img/products/teclado-mecanico-60.jpg', 1),
(1, 'Teclado Membrana RGB', 'Full size, negro', 'Full size con teclado numérico e iluminación RGB de varios efectos.', 32000, '/img/products/teclado-membrana-rgb.jpg', 1),
(1, 'Mouse Gamer Inalámbrico', '26000 DPI, gris', 'Sensor óptico de 26000 DPI, conexión inalámbrica de baja latencia.', 62000, '/img/products/mouse-gamer-inalambrico.jpg', 1),
(1, 'Mouse Gamer Liviano', '16000 DPI, negro', 'Diseño liviano con carcasa perforada y cable flexible.', 41000, '/img/products/mouse-gamer-liviano.jpg', 1),
(1, 'Mouse Ergonómico', '12000 DPI, negro', 'Forma ergonómica para sesiones largas, 6 botones programables.', 36000, '/img/products/mouse-ergonomico.jpg', 1),
(1, 'Auriculares Gamer 7.1', 'Micrófono desmontable, azul', 'Sonido envolvente 7.1 virtual y micrófono con cancelación de ruido.', 74000, '/img/products/auriculares-gamer-71.jpg', 1),
(1, 'Auriculares Inalámbricos', 'Bluetooth 5.3, negro', 'Bluetooth 5.3 con hasta 30 horas de batería.', 69000, '/img/products/auriculares-inalambricos.jpg', 1),
(1, 'Auriculares Over-Ear', 'Cable 3.5 mm, rojo', 'Over-ear con almohadillas acolchadas y cable de 3.5 mm.', 38000, '/img/products/auriculares-over-ear.jpg', 1),
(1, 'Combo Teclado + Mouse', 'Kit RGB, negro', 'Kit de teclado y mouse con iluminación RGB sincronizada.', 49000, '/img/products/combo-teclado-mouse.jpg', 1),
(1, 'Teclado Retro Edición Limitada', 'Switch Blue, beige', 'Edición limitada con estética retro (producto inactivo de prueba).', 95000, '/img/products/teclado-retro.jpg', 0);

-- categoria 2: componentes y accesorios
insert into products (category_id, name, variant, description, price, image, active) values
(2, 'Mousepad XL Control', '900x400 mm, gris carbón', 'Superficie de control con base antideslizante, tamaño XL.', 22000, '/img/products/mousepad-xl-control.jpg', 1),
(2, 'Mousepad Speed', '450x400 mm, negro', 'Superficie lisa pensada para movimientos rápidos.', 12000, '/img/products/mousepad-speed.jpg', 1),
(2, 'Mousepad RGB', '800x300 mm, negro', 'Bordes con iluminación RGB y conexión USB.', 27000, '/img/products/mousepad-rgb.jpg', 1),
(2, 'Soporte Articulado Monitor', 'Hasta 32", negro', 'Brazo articulado con ajuste de altura e inclinación.', 45000, '/img/products/soporte-articulado-monitor.jpg', 1),
(2, 'Soporte Doble Monitor', 'Hasta 27", negro', 'Soporte para dos monitores con gestión de cables.', 72000, '/img/products/soporte-doble-monitor.jpg', 1),
(2, 'Soporte para Auriculares', 'Con hub USB, negro', 'Soporte de escritorio con hub USB de 3 puertos.', 18000, '/img/products/soporte-auriculares.jpg', 1),
(2, 'Micrófono USB Condensador', 'Brazo articulado, negro', 'Micrófono condensador plug and play con brazo articulado.', 68000, '/img/products/microfono-usb-condensador.jpg', 1),
(2, 'Micrófono de Mesa', 'Cardioide, plateado', 'Patrón cardioide con base de mesa y control de volumen.', 54000, '/img/products/microfono-de-mesa.jpg', 1),
(2, 'Brazo para Micrófono', 'Boom, negro', 'Brazo boom con resorte interno y soporte antivibración.', 24000, '/img/products/brazo-microfono.jpg', 1),
(2, 'Tira LED para Setup', '3 m, RGB', 'Tira LED RGB de 3 metros con control remoto.', 16000, '/img/products/tira-led-setup.jpg', 1),
(2, 'Capturadora de Video 4K', 'USB 3.0, negro', 'Capturadora externa para streaming (producto inactivo de prueba).', 88000, '/img/products/capturadora-4k.jpg', 0);
