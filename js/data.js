/* ==========================================================================
   js/data.js  —  Simulacion de base de datos con localStorage.

   IMPORTANTE:
   Este proyecto NO usa un servidor ni una base de datos real.
   localStorage guarda informacion en el navegador del usuario para poder
   demostrar el funcionamiento de la aplicacion.

   Para una aplicacion real se necesitaria un BACKEND (ej. Node.js, PHP,
   Python) y una base de datos (ej. MySQL, PostgreSQL).
   ========================================================================== */

'use strict';

/* ------------------------- Constantes globales ------------------------- */

// Costo de envio fijo para cada pedido.
const ENVIO = 20;

// Otros gastos fijos mensuales de demostracion (luz, agua, etc.).
const OTROS_GASTOS = 200;

// Nombres (claves) que se usan en localStorage.
const CLAVES = {
  productos: 'hde_productos',
  ingredientes: 'hde_ingredientes',
  pedidos: 'hde_pedidos',
  empleados: 'hde_empleados',
  pagos: 'hde_pagos',
  inventario: 'hde_inventario',
  usuarios: 'hde_usuarios',
  carrito: 'hde_carrito',
  sesion: 'hde_sesion',
  configurado: 'hde_configurado'
};

// Ingredientes adicionales que el cliente puede elegir al personalizar
// un hot dog o una hamburguesa (cada uno con su precio extra).
const EXTRAS_PERSONALIZACION = [
  { id: 'tocino',    nombre: 'Tocino adicional', precio: 10 },
  { id: 'queso',     nombre: 'Queso extra',      precio: 10 },
  { id: 'jalapenos', nombre: 'Jalapeños',        precio: 5  },
  { id: 'cebolla',   nombre: 'Cebolla extra',    precio: 5  },
  { id: 'lechuga',   nombre: 'Lechuga extra',    precio: 5  },
  { id: 'jitomate',  nombre: 'Jitomate extra',   precio: 5  }
];

// Imagenes disponibles para poder elegir la foto de un producto.
const IMAGENES_DISPONIBLES = [
  'img/hotdog-clasico.jpg',
  'img/hotdog-tocino.jpg',
  'img/hamburguesa.jpg',
  'img/papas.jpg',
  'img/refresco.jpg',
  'img/queso.jpg',
  'img/tocino.jpg',
  'img/jalapenos.jpg',
  'img/cebolla.jpg',
  'img/lechuga.jpg'
];

/* -------------------- Funciones para localStorage ---------------------- */

// Lee un arreglo guardado en localStorage. Si no existe, devuelve el valor
// por defecto (asi la app nunca falla cuando el navegador esta vacio).
function leer(clave, valorDefecto) {
  const guardado = localStorage.getItem(clave);
  if (guardado === null) return valorDefecto;
  try {
    return JSON.parse(guardado);
  } catch (error) {
    return valorDefecto;
  }
}

// Guarda un valor (convertido a texto JSON) en localStorage.
function guardar(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// Devuelve el siguiente id disponible en un arreglo.
function siguienteId(arreglo) {
  return arreglo.reduce((maximo, item) => Math.max(maximo, item.id || 0), 0) + 1;
}

/* ------------------------ Datos de demostracion ------------------------- */

// Productos iniciales del menu.
const PRODUCTOS_DEFAULT = [
  {
    id: 1, nombre: 'Hot Dog clásico', categoria: 'hotdog',
    descripcion: 'El favorito de todos: pan suave, salchicha, cebolla y jitomate.',
    ingredientes: ['Pan', 'Salchicha', 'Cebolla', 'Jitomate'],
    precio: 45, costo: 18, img: 'img/hotdog-clasico.jpg', disponible: true
  },
  {
    id: 2, nombre: 'Hot Dog con tocino', categoria: 'hotdog',
    descripcion: 'Nuestro clásico con crujiente tocino, lechuga, jitomate y cebolla.',
    ingredientes: ['Pan', 'Salchicha', 'Tocino', 'Lechuga', 'Jitomate', 'Cebolla'],
    precio: 55, costo: 24, img: 'img/hotdog-tocino.jpg', disponible: true
  },
  {
    id: 3, nombre: 'Hot Dog sin tocino', categoria: 'hotdog',
    descripcion: 'La opción ligera: pan, salchicha, lechuga, jitomate y cebolla.',
    ingredientes: ['Pan', 'Salchicha', 'Lechuga', 'Jitomate', 'Cebolla'],
    precio: 45, costo: 17, img: 'img/hotdog-clasico.jpg', disponible: true
  },
  {
    id: 4, nombre: 'Hot Dog especial', categoria: 'hotdog',
    descripcion: 'El más completo: tocino, queso, lechuga, jitomate y cebolla.',
    ingredientes: ['Pan', 'Salchicha', 'Tocino', 'Queso', 'Lechuga', 'Jitomate', 'Cebolla'],
    precio: 65, costo: 30, img: 'img/hotdog-tocino.jpg', disponible: true
  },
  {
    id: 5, nombre: 'Hamburguesa clásica', categoria: 'hamburguesa',
    descripcion: 'Jugosa carne de res con lechuga, jitomate y cebolla.',
    ingredientes: ['Carne', 'Pan', 'Lechuga', 'Jitomate', 'Cebolla'],
    precio: 70, costo: 32, img: 'img/hamburguesa.jpg', disponible: true
  },
  {
    id: 6, nombre: 'Hamburguesa con tocino', categoria: 'hamburguesa',
    descripcion: 'Carne de res con tocino, queso, lechuga, jitomate y cebolla.',
    ingredientes: ['Carne', 'Pan', 'Queso', 'Tocino', 'Lechuga', 'Jitomate', 'Cebolla'],
    precio: 85, costo: 40, img: 'img/hamburguesa.jpg', disponible: true
  },
  {
    id: 7, nombre: 'Papas', categoria: 'complemento',
    descripcion: 'Crujientes papas a la francesa. ¡Perfectas para compartir!',
    ingredientes: ['Papas'],
    precio: 30, costo: 8, img: 'img/papas.jpg', disponible: true
  },
  {
    id: 8, nombre: 'Refresco', categoria: 'complemento',
    descripcion: 'Refresco bien frío de 500 ml para acompañar tu comida.',
    ingredientes: ['Refresco'],
    precio: 20, costo: 9, img: 'img/refresco.jpg', disponible: true
  },
  {
    id: 9, nombre: 'Queso adicional', categoria: 'complemento',
    descripcion: 'Extra de queso derretido para tu hot dog o hamburguesa.',
    ingredientes: ['Queso'],
    precio: 10, costo: 4, img: 'img/queso.jpg', disponible: true
  },
  {
    id: 10, nombre: 'Tocino adicional', categoria: 'complemento',
    descripcion: 'Más tocino crujiente, porque nunca es suficiente.',
    ingredientes: ['Tocino'],
    precio: 10, costo: 4, img: 'img/tocino.jpg', disponible: true
  },
  {
    id: 11, nombre: 'Jalapeños', categoria: 'complemento',
    descripcion: 'Rodajas de jalapeño para darle un toque picante.',
    ingredientes: ['Jalapeños'],
    precio: 5, costo: 2, img: 'img/jalapenos.jpg', disponible: true
  },
  {
    id: 12, nombre: 'Cebolla adicional', categoria: 'complemento',
    descripcion: 'Extra de cebolla fresca.',
    ingredientes: ['Cebolla'],
    precio: 5, costo: 2, img: 'img/cebolla.jpg', disponible: true
  },
  {
    id: 13, nombre: 'Lechuga adicional', categoria: 'complemento',
    descripcion: 'Extra de lechuga fresca y crujiente.',
    ingredientes: ['Lechuga'],
    precio: 5, costo: 2, img: 'img/lechuga.jpg', disponible: true
  }
];

// Inventario inicial de ingredientes (cantidad, unidad y stock minimo).
const INGREDIENTES_DEFAULT = [
  { id: 1, nombre: 'Pan',       cantidad: 100, unidad: 'piezas', minimo: 20 },
  { id: 2, nombre: 'Salchicha', cantidad: 150, unidad: 'piezas', minimo: 30 },
  { id: 3, nombre: 'Tocino',    cantidad: 5,   unidad: 'kg',     minimo: 2  },
  { id: 4, nombre: 'Lechuga',   cantidad: 10,  unidad: 'piezas', minimo: 3  },
  { id: 5, nombre: 'Jitomate',  cantidad: 15,  unidad: 'kg',     minimo: 4  },
  { id: 6, nombre: 'Cebolla',   cantidad: 12,  unidad: 'kg',     minimo: 3  },
  { id: 7, nombre: 'Queso',     cantidad: 8,   unidad: 'kg',     minimo: 2  },
  { id: 8, nombre: 'Carne',     cantidad: 10,  unidad: 'kg',     minimo: 3  }
];

// Empleados iniciales.
const EMPLEADOS_DEFAULT = [
  { id: 1, nombre: 'Juan Pérez',  puesto: 'Cocinero',   telefono: '555-1010', pagoDia: 350, estado: 'Activo' },
  { id: 2, nombre: 'Pedro López', puesto: 'Atención',   telefono: '555-2020', pagoDia: 300, estado: 'Activo' },
  { id: 3, nombre: 'Luis García', puesto: 'Repartidor', telefono: '555-3030', pagoDia: 250, estado: 'Activo' }
];

// Usuarios del sistema (usuario / contraseña)  —  solo demostración.
const USUARIOS_DEFAULT = [
  { usuario: 'admin', contrasena: 'admin123' }
];

// Movimientos iniciales de almacén (entradas y salidas de ingredientes).
const INVENTARIO_DEFAULT = [
  { id: 1, fecha: '',    ingrediente: 'Pan',       tipo: 'entrada', cantidad: 100, unidad: 'piezas', motivo: 'Compra inicial' },
  { id: 2, fecha: '',    ingrediente: 'Salchicha', tipo: 'entrada', cantidad: 150, unidad: 'piezas', motivo: 'Compra inicial' },
  { id: 3, fecha: '',    ingrediente: 'Tocino',    tipo: 'entrada', cantidad: 5,   unidad: 'kg',     motivo: 'Compra inicial' },
  { id: 4, fecha: '',    ingrediente: 'Lechuga',   tipo: 'entrada', cantidad: 10,  unidad: 'piezas', motivo: 'Compra inicial' },
  { id: 5, fecha: '',    ingrediente: 'Jitomate',  tipo: 'entrada', cantidad: 15,  unidad: 'kg',     motivo: 'Compra inicial' }
];

/* ---------------------- Utilidades de fechas ---------------------------- */

// Agrega ceros a la izquierda (ej. 7 -> "07").
function conCerro(numero) {
  return String(numero).padStart(2, '0');
}

// Convierte un objeto Date a texto local: "AAAA-MM-DD HH:MM".
function formatoFechaLocal(fecha) {
  return fecha.getFullYear() + '-' +
    conCerro(fecha.getMonth() + 1) + '-' +
    conCerro(fecha.getDate()) + ' ' +
    conCerro(fecha.getHours()) + ':' +
    conCerro(fecha.getMinutes());
}

// Devuelve una fecha con texto "AAAA-MM-DD HH:MM" separada cierta cantidad
// de días hacia atrás (dias=0 significa hoy). Se usa para los datos demo.
function fechaDiasAtras(dias, hora) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return formatoFechaLocal(fecha);
}

/* ------------------------ Pedidos de demostracion ----------------------- */

// Busca un producto por su nombre exacto.
function buscarProducto(nombre) {
  return PRODUCTOS_DEFAULT.find(producto => producto.nombre === nombre);
}

// Crea un elemento del carrito con personalización opcional.
function nuevaLinea(producto, extras = [], cantidad = 1) {
  const precioExtra = extras.reduce((total, extra) => total + extra.precio, 0);
  const precioUnitario = producto.precio + precioExtra;
  return {
    productoId: producto.id,
    nombre: producto.nombre,
    img: producto.img,
    extras: extras.map(extra => extra.nombre),
    precioUnitario: precioUnitario,
    cantidad: cantidad,
    subtotal: precioUnitario * cantidad
  };
}

// Crea un pedido completo (también calcula el total con envío).
function nuevoPedido(id, cliente, telefono, direccion, pago, estado, diasAtras, hora, lineas) {
  const subtotal = lineas.reduce((total, linea) => total + linea.subtotal, 0);
  return {
    id: id,
    cliente: cliente,
    telefono: telefono,
    direccion: direccion,
    referencias: 'Entrega a domicilio',
    pago: pago,
    comentarios: '',
    items: lineas,
    subtotal: subtotal,
    envio: ENVIO,
    total: subtotal + ENVIO,
    estado: estado,
    fecha: fechaDiasAtras(diasAtras, hora)
  };
}

// Genera un conjunto de pedidos de ejemplo repartidos en los últimos 7 días.
// Así el dashboard, las ventas y los reportes tienen datos para mostrar.
function pedidosDeDemostracion() {
  const hdClasico = buscarProducto('Hot Dog clásico');
  const hdTocino = buscarProducto('Hot Dog con tocino');
  const hdEspecial = buscarProducto('Hot Dog especial');
  const hbClasica = buscarProducto('Hamburguesa clásica');
  const hbTocino = buscarProducto('Hamburguesa con tocino');
  const papas = buscarProducto('Papas');
  const refresco = buscarProducto('Refresco');

  // Pedido personalizado: hot dog clásico con tocino extra y queso extra.
  const hdPersonalizado = nuevaLinea(hdClasico,
    [{ nombre: 'Tocino adicional', precio: 10 }, { nombre: 'Queso extra', precio: 10 }], 2);

  return [
    nuevoPedido(1,  'Juan',       '555-1111', 'Av. Principal 123',     'Efectivo',      'ENTREGADO',   0, '13:15', [nuevaLinea(hdTocino, [], 1), nuevaLinea(refresco, [], 1)]),
    nuevoPedido(2,  'María',      '555-2222', 'Calle 5 de Mayo 45',    'Tarjeta',       'ENTREGADO',   0, '13:40', [nuevaLinea(hdEspecial, [], 2), nuevaLinea(papas, [], 1)]),
    nuevoPedido(3,  'Pedro',      '555-3333', 'Calle Juárez 8',        'Efectivo',      'PREPARANDO',  0, '17:05', [nuevaLinea(hbClasica, [], 1), nuevaLinea(refresco, [], 2)]),
    nuevoPedido(4,  'Ana',        '555-4444', 'Av. Reforma 90',        'Transferencia', 'LISTO',       0, '18:20', [hdPersonalizado, nuevaLinea(papas, [], 1)]),
    nuevoPedido(5,  'Luis',       '555-5555', 'Calle Hidalgo 22',      'Efectivo',      'PENDIENTE',   0, '19:10', [nuevaLinea(hbTocino, [], 1), nuevaLinea(hdTocino, [], 1)]),
    nuevoPedido(6,  'Sergio',     '555-6666', 'Av. Universidad 300',   'Tarjeta',       'ENTREGADO',   0, '15:00', [nuevaLinea(hbClasica, [], 2)]),
    nuevoPedido(7,  'Carmen',     '555-7777', 'Calle Morelos 15',      'Efectivo',      'ENTREGADO',   1, '12:30', [nuevaLinea(hdTocino, [], 2), nuevaLinea(refresco, [], 2)]),
    nuevoPedido(8,  'Roberto',    '555-8888', 'Av. Central 7',         'Tarjeta',       'ENTREGADO',   1, '14:10', [nuevaLinea(hdClasico, [], 3), nuevaLinea(papas, [], 2)]),
    nuevoPedido(9,  'Laura',      '555-9999', 'Calle del Sol 60',      'Efectivo',      'ENTREGADO',   1, '16:45', [nuevaLinea(hbClasica, [], 1), nuevaLinea(hdEspecial, [], 1)]),
    nuevoPedido(10, 'Miguel',     '555-1010', 'Av. Insurgentes 5',     'Transferencia', 'ENTREGADO',   2, '13:00', [nuevaLinea(hdClasico, [], 2), nuevaLinea(refresco, [], 3)]),
    nuevoPedido(11, 'Sofía',      '555-2020', 'Calle Roble 33',        'Efectivo',      'ENTREGADO',   2, '14:30', [nuevaLinea(hbTocino, [], 1), nuevaLinea(papas, [], 1)]),
    nuevoPedido(12, 'Diego',      '555-3030', 'Av. Las Torres 12',     'Efectivo',      'CANCELADO',   2, '20:00', [nuevaLinea(hdTocino, [], 4)]),
    nuevoPedido(13, 'Valentina',  '555-4040', 'Calle Luna 9',          'Tarjeta',       'ENTREGADO',   3, '12:00', [nuevaLinea(hdEspecial, [], 3), nuevaLinea(refresco, [], 2)]),
    nuevoPedido(14, 'Ricardo',    '555-5050', 'Av. Verde 77',          'Efectivo',      'ENTREGADO',   3, '13:30', [nuevaLinea(hdTocino, [], 1), nuevaLinea(hbClasica, [], 1)]),
    nuevoPedido(15, 'Fernanda',   '555-6060', 'Calle Álamo 4',         'Efectivo',      'ENTREGADO',   4, '15:00', [nuevaLinea(hdClasico, [], 4)]),
    nuevoPedido(16, 'Andrés',     '555-7070', 'Av. Norte 88',          'Tarjeta',       'ENTREGADO',   4, '16:00', [nuevaLinea(hbTocino, [], 2), nuevaLinea(refresco, [], 2)]),
    nuevoPedido(17, 'Camila',     '555-8080', 'Calle Primavera 19',    'Efectivo',      'ENTREGADO',   5, '12:20', [nuevaLinea(hdTocino, [], 2), nuevaLinea(papas, [], 1), nuevaLinea(refresco, [], 1)]),
    nuevoPedido(18, 'Jorge',      '555-9090', 'Av. Constitución 3',    'Transferencia', 'ENTREGADO',   5, '18:00', [nuevaLinea(hdClasico, [], 1), nuevaLinea(hbClasica, [], 1), nuevaLinea(refresco, [], 1)]),
    nuevoPedido(19, 'Paola',      '555-1112', 'Calle Aurora 56',       'Efectivo',      'ENTREGADO',   6, '10:00', [nuevaLinea(hdEspecial, [], 2)]),
    nuevoPedido(20, 'Emilio',     '555-1113', 'Av. Mar 14',            'Tarjeta',       'ENTREGADO',   6, '12:00', [nuevaLinea(hbTocino, [], 1), nuevaLinea(hdClasico, [], 2)])
  ];
}

/* -------------------- Pagos iniciales de demostración ------------------- */

function pagosDeDemostracion() {
  return [
    { id: 1, empleadoId: 1, empleado: 'Juan Pérez',  puesto: 'Cocinero',
      dias: 6, pagoDia: 350, total: 2100, estado: 'PAGADO',
      fecha: fechaDiasAtras(1, '18:00') },
    { id: 2, empleadoId: 2, empleado: 'Pedro López', puesto: 'Atención',
      dias: 5, pagoDia: 300, total: 1500, estado: 'PAGADO',
      fecha: fechaDiasAtras(3, '18:00') },
    { id: 3, empleadoId: 3, empleado: 'Luis García', puesto: 'Repartidor',
      dias: 4, pagoDia: 250, total: 1000, estado: 'PENDIENTE',
      fecha: fechaDiasAtras(0, '18:00') }
  ];
}

/* --------------------------- Inicialización ----------------------------- */

// Carga los datos de demostración la primera vez que se abre la página.
// Si el usuario ya tiene datos guardados, NO los vuelve a crear.
function iniciarDatos() {
  if (localStorage.getItem(CLAVES.configurado)) return;

  guardar(CLAVES.productos, PRODUCTOS_DEFAULT);
  guardar(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  guardar(CLAVES.pedidos, pedidosDeDemostracion());
  guardar(CLAVES.empleados, EMPLEADOS_DEFAULT);
  guardar(CLAVES.pagos, pagosDeDemostracion());

  // Registra la compra inicial como entradas de almacén.
  const movimientos = INVENTARIO_DEFAULT.map(mov => {
    return Object.assign({}, mov, { fecha: fechaDiasAtras(7, '09:00') });
  });
  guardar(CLAVES.inventario, movimientos);

  guardar(CLAVES.usuarios, USUARIOS_DEFAULT);
  guardar(CLAVES.carrito, []);
  guardar(CLAVES.sesion, false);
  localStorage.setItem(CLAVES.configurado, 'true');
}

// Se ejecuta la inicialización apenas se carga el archivo.
iniciarDatos();