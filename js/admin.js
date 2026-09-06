/* ==========================================================================
   js/admin.js  —  Panel administrativo de HotDog Express.

   Secciones:
   - Protección de la página (requiere iniciar sesión).
   - Navegación entre secciones del menú lateral.
   - Dashboard con indicadores y gráficas (canvas, sin librerías externas).
   - Pedidos (cambiar estado, ver, cancelar, eliminar).
   - Productos (agregar, editar, eliminar, cambiar precio/disponibilidad).
   - Ingredientes (stock, stock mínimo, alertas).
   - Inventario (entradas y salidas con motivo).
   - Ventas (día, semana, mes, categorías y métodos de pago).
   - Reportes (generar e imprimir).
   - Utilidades (ventas - costos - pagos - otros gastos).
   - Personal (empleados) y Pagos al personal.
   ========================================================================== */

'use strict';

/* Títulos de cada sección para la cabecera. */
const TITULOS_SECCION = {
  dashboard: 'Dashboard',
  pedidos: 'Pedidos',
  productos: 'Productos',
  ingredientes: 'Ingredientes',
  inventario: 'Inventario',
  ventas: 'Ventas',
  reportes: 'Reportes',
  utilidades: 'Utilidades',
  personal: 'Personal',
  pagos: 'Pagos'
};

/* --------------------- Utilerías de fechas y negocio --------------------- */

// Devuelve la fecha de hoy como "AAAA-MM-DD".
function diaActualTexto() {
  return formatoFechaLocal(new Date()).slice(0, 10);
}

// Devuelve la fecha de hoy sumando (o restando) días: "AAAA-MM-DD".
function fechaSumaDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return formatoFechaLocal(fecha).slice(0, 10);
}

// True si la fecha de un registro está dentro del rango [desde, hasta].
function entreFechas(fechaTexto, desde, hasta) {
  const dia = (fechaTexto || '').slice(0, 10);
  return dia >= desde && dia <= hasta;
}

// Nombre corto del día de una fecha "AAAA-MM-DD" (ej. "lun").
function nombreDiaCorto(fechaTexto) {
  const partes = fechaTexto.split('-');
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  return fecha.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
}

// Costo real estimado de una línea vendida (precio de costo de los ingredientes).
function costoDeLineaVendida(linea) {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const producto = productos.find(p => p.id === linea.productoId);
  return producto ? (producto.costo || 0) * linea.cantidad : 0;
}

// Calcula todas las cifras de un periodo para reportes/utilidades/dashboard.
function calcularReporte(periodo) {
  let desde = diaActualTexto();
  if (periodo === 'semana') desde = fechaSumaDias(-6);
  if (periodo === 'mes') desde = diaActualTexto().slice(0, 8) + '01';
  const hasta = diaActualTexto();

  const pedidos = leer(CLAVES.pedidos, [])
    .filter(p => p.estado === 'ENTREGADO' && entreFechas(p.fecha, desde, hasta));

  const ventas = pedidos.reduce((total, pedido) => total + pedido.total, 0);
  const productosVendidos = pedidos.reduce(
    (total, pedido) => total + pedido.items.reduce((suma, linea) => suma + linea.cantidad, 0), 0);
  const costoIngredientes = pedidos.reduce(
    (total, pedido) => total + pedido.items.reduce((suma, linea) => suma + costoDeLineaVendida(linea), 0), 0);

  const pagosPersonal = leer(CLAVES.pagos, [])
    .filter(p => p.estado === 'PAGADO' && entreFechas(p.fecha, desde, hasta))
    .reduce((total, pago) => total + pago.total, 0);

  // Los otros gastos se reparten de forma proporcional para la demostración.
  let otrosGastos = OTROS_GASTOS;
  if (periodo === 'hoy') otrosGastos = 0;
  if (periodo === 'semana') otrosGastos = Math.round(OTROS_GASTOS / 4);

  const utilidad = ventas - costoIngredientes - pagosPersonal - otrosGastos;

  return {
    pedidos: pedidos,
    ventas: ventas,
    productosVendidos: productosVendidos,
    costoIngredientes: costoIngredientes,
    pagosPersonal: pagosPersonal,
    otrosGastos: otrosGastos,
    utilidad: utilidad
  };
}

/* ---------------------------- Navegación --------------------------------- */

// Muestra una sección del panel y oculta las demás.
function mostrarSeccion(clave) {
  // Oculta todas las secciones.
  $$('.admin-seccion').forEach(seccion => {
    seccion.hidden = seccion.id !== 'seccion-' + clave;
  });

  // Marca el botón activo del menú.
  $$('#admin-menu button').forEach(boton => {
    boton.classList.toggle('activo', boton.dataset.seccion === clave);
  });

  // Actualiza el título y refresca los datos de la sección.
  $('#titulo-seccion').textContent = TITULOS_SECCION[clave];
  if (clave === 'dashboard') renderizarDashboard();
  if (clave === 'pedidos') renderizarPedidos();
  if (clave === 'productos') renderizarProductos();
  if (clave === 'ingredientes') renderizarIngredientes();
  if (clave === 'inventario') renderizarMovimientos();
  if (clave === 'ventas') renderizarVentas();
  if (clave === 'utilidades') renderizarUtilidades();
  if (clave === 'personal') renderizarPersonal();
  if (clave === 'pagos') renderizarPagos();

  // En teléfonos cierra el menú lateral.
  const lateral = $('#admin-lateral');
  lateral.classList.remove('abierto');
  $('#admin-cortina').style.display = 'none';

  window.scrollTo({ top: 0 });
}

// Cierra la sesión y regresa al login.
function cerrarSesion() {
  guardar(CLAVES.sesion, false);
  window.location.href = 'login.html';
}

/* ============================ DASHBOARD ================================== */

// Llena las tarjetas de indicadores del día.
function renderizarDashboard() {
  const reporte = calcularReporte('hoy');
  const pedidosHoy = leer(CLAVES.pedidos, [])
    .filter(p => entreFechas(p.fecha, diaActualTexto(), diaActualTexto()) && p.estado !== 'CANCELADO');

  $('#dato-ventas').textContent = formatearPrecio(reporte.ventas);
  $('#dato-pedidos').textContent = pedidosHoy.length;
  $('#dato-productos').textContent = reporte.productosVendidos;
  $('#dato-utilidad').textContent = formatearPrecio(reporte.utilidad);

  dibujarVentas7Dias();
  dibujarTopProductos();
  dibujarPedidos7Dias();
}

// Dibuja una gráfica de barras verticales.
function dibujarBarrasVerticales(canvas, etiquetas, valores, color, formatoValor) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const margenArriba = 20;
  const margenAbajo = 24;
  const margenLado = 10;
  const areaAlto = h - margenArriba - margenAbajo;
  const maximo = Math.max.apply(null, valores.concat([1]));

  // Línea base.
  ctx.strokeStyle = '#e5d8c8';
  ctx.beginPath();
  ctx.moveTo(margenLado, h - margenAbajo);
  ctx.lineTo(w - margenLado, h - margenAbajo);
  ctx.stroke();

  const n = valores.length;
  const paso = (w - margenLado * 2) / n;
  const ancho = paso * 0.55;

  valores.forEach((valor, i) => {
    const alto = (valor / maximo) * areaAlto;
    const x = margenLado + i * paso + (paso - ancho) / 2;
    const y = h - margenAbajo - alto;

    // Barra.
    ctx.fillStyle = valor === 0 ? '#e8e1d5' : color;
    ctx.fillRect(x, y, ancho, alto);

    // Valor encima de la barra.
    ctx.fillStyle = '#6b5b4e';
    ctx.font = '10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(formatoValor(valor), x + ancho / 2, y - 4);

    // Etiqueta debajo.
    ctx.fillText(etiquetas[i], x + ancho / 2, h - 8);
  });
}

// Dibuja una gráfica de barras horizontales (para el top de productos).
function dibujarBarrasHorizontales(canvas, etiquetas, valores, color) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const margenIzq = 128;
  const margenDer = 40;
  const maximo = Math.max.apply(null, valores.concat([1]));
  const n = valores.length;
  const paso = (h - 16) / Math.max(n, 1);
  const ancho = paso * 0.6;

  valores.forEach((valor, i) => {
    const y = 10 + i * paso + (paso - ancho) / 2;
    const largo = ((w - margenIzq - margenDer) / maximo) * valor;

    // Nombre del producto (truncado).
    ctx.fillStyle = '#4a403a';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'right';
    let nombre = etiquetas[i];
    if (nombre.length > 21) nombre = nombre.slice(0, 20) + '…';
    ctx.fillText(nombre, margenIzq - 8, y + ancho / 2 + 4);

    // Barra.
    ctx.fillStyle = color;
    ctx.fillRect(margenIzq, y, largo, ancho);

    // Valor al final de la barra.
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b5b4e';
    ctx.fillText(String(valor), margenIzq + largo + 8, y + ancho / 2 + 4);
  });
}

// Gráfica: ventas de los últimos 7 días.
function dibujarVentas7Dias() {
  const canvas = $('#grafica-ventas');
  const entregados = leer(CLAVES.pedidos, []).filter(p => p.estado === 'ENTREGADO');

  const etiquetas = [];
  const valores = [];
  for (let i = 6; i >= 0; i--) {
    const dia = fechaSumaDias(-i);
    const total = entregados
      .filter(p => entreFechas(p.fecha, dia, dia))
      .reduce((suma, p) => suma + p.total, 0);
    etiquetas.push(nombreDiaCorto(dia));
    valores.push(total);
  }

  dibujarBarrasVerticales(canvas, etiquetas, valores, '#d62828',
    valor => (valor >= 1000 ? (valor / 1000).toFixed(1) + 'k' : String(valor)));
}

// Gráfica: productos más vendidos (conteo de unidades).
function dibujarTopProductos() {
  const canvas = $('#grafica-top');
  const entregados = leer(CLAVES.pedidos, []).filter(p => p.estado === 'ENTREGADO');

  const conteo = {};
  entregados.forEach(pedido => {
    pedido.items.forEach(linea => {
      conteo[linea.nombre] = (conteo[linea.nombre] || 0) + linea.cantidad;
    });
  });

  const ordenado = Object.keys(conteo)
    .map(nombre => [nombre, conteo[nombre]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  dibujarBarrasHorizontales(canvas, ordenado.map(x => x[0]), ordenado.map(x => x[1]), '#ffba08');
}

// Gráfica: pedidos realizados en los últimos 7 días.
function dibujarPedidos7Dias() {
  const canvas = $('#grafica-pedidos');
  const pedidos = leer(CLAVES.pedidos, []).filter(p => p.estado !== 'CANCELADO');

  const etiquetas = [];
  const valores = [];
  for (let i = 6; i >= 0; i--) {
    const dia = fechaSumaDias(-i);
    const conteo = pedidos.filter(p => entreFechas(p.fecha, dia, dia)).length;
    etiquetas.push(nombreDiaCorto(dia));
    valores.push(conteo);
  }

  dibujarBarrasVerticales(canvas, etiquetas, valores, '#2563eb', String);
}

/* ============================= PEDIDOS =================================== */

// Dibuja la tabla de pedidos aplicando el filtro de estado.
function renderizarPedidos() {
  const filtro = $('#filtro-estado').value;
  const pedidos = leer(CLAVES.pedidos, [])
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter(p => !filtro || p.estado === filtro);

  const cuerpo = $('#cuerpo-pedidos');
  if (pedidos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="6">No hay pedidos que mostrar.</td></tr>';
    return;
  }

  const opcionesEstado = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'];
  const claseInsignia = {
    PENDIENTE: 'insignia-ambar',
    PREPARANDO: 'insignia-azul',
    LISTO: 'insignia-verde',
    ENTREGADO: 'insignia-verde',
    CANCELADO: 'insignia-gris'
  };

  let html = '';
  pedidos.forEach(pedido => {
    const opciones = opcionesEstado.map(estado =>
      '<option value="' + estado + '"' + (estado === pedido.estado ? ' selected' : '') + '>' +
      estado + '</option>').join('');

    html +=
      '<tr>' +
      '  <td><strong>#' + String(pedido.id).padStart(4, '0') + '</strong></td>' +
      '  <td>' + pedido.cliente + '</td>' +
      '  <td>' + formatearFechaHora(pedido.fecha) + '</td>' +
      '  <td><strong>' + formatearPrecio(pedido.total) + '</strong></td>' +
      '  <td>' +
      '    <select class="selector-estado" onchange="cambiarEstadoPedido(' + pedido.id + ', this.value)">' +
             opciones +
      '    </select>' +
      '    <span class="insignia ' + claseInsignia[pedido.estado] + '" style="display:block; margin-top:5px;">' + pedido.estado + '</span>' +
      '  </td>' +
      '  <td>' +
      '    <button class="btn-accion ver" onclick="verPedido(' + pedido.id + ')">Ver</button> ' +
      '    <button class="btn-accion cancelar" onclick="cancelarPedido(' + pedido.id + ')">Cancelar</button> ' +
      '    <button class="btn-accion eliminar" onclick="eliminarPedido(' + pedido.id + ')">Eliminar</button>' +
      '  </td>' +
      '</tr>';
  });
  cuerpo.innerHTML = html;
}

// Cambia el estado de un pedido (PENDIENTE → PREPARANDO → LISTO → ENTREGADO).
function cambiarEstadoPedido(id, estado) {
  const pedidos = leer(CLAVES.pedidos, []);
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  pedido.estado = estado;
  guardar(CLAVES.pedidos, pedidos);
  renderizarPedidos();
  renderizarDashboard();
  mostrarToast('El pedido #' + String(id).padStart(4, '0') + ' ahora está ' + estado + '.', 'exito');
}

// Muestra el detalle completo de un pedido en una ventana modal.
function verPedido(id) {
  const pedidos = leer(CLAVES.pedidos, []);
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  $('#modal-pedido-titulo').textContent = 'Pedido #' + String(pedido.id).padStart(4, '0');

  let articulos = '';
  pedido.items.forEach(linea => {
    const extras = linea.extras.length > 0
      ? ' <em>(' + linea.extras.join(' + ') + ')</em>'
      : '';
    articulos +=
      '<p>' + linea.nombre + ' x' + linea.cantidad + extras +
      ' — ' + formatearPrecio(linea.subtotal) + '</p>';
  });

  $('#modal-pedido-cuerpo').innerHTML =
    '<div class="detalle-pedido">' +
    '  <p><strong>Cliente:</strong> ' + pedido.cliente + '</p>' +
    '  <p><strong>Teléfono:</strong> ' + pedido.telefono + '</p>' +
    '  <p><strong>Dirección:</strong> ' + pedido.direccion + '</p>' +
    '  <p><strong>Referencias:</strong> ' + (pedido.referencias || '-') + '</p>' +
    '  <p><strong>Método de pago:</strong> ' + pedido.pago + '</p>' +
    '  <p><strong>Comentarios:</strong> ' + (pedido.comentarios || '-') + '</p>' +
    '  <p><strong>Fecha:</strong> ' + formatearFechaHora(pedido.fecha) + '</p>' +
    '  <hr>' + articulos +
    '  <hr>' +
    '  <p>Envío: ' + formatearPrecio(pedido.envio) + '</p>' +
    '  <p><strong>Total: ' + formatearPrecio(pedido.total) + '</strong></p>' +
    '  <p>Estado: <strong>' + pedido.estado + '</strong></p>' +
    '</div>';

  $('#modal-pedido').hidden = false;
}

// Cancela un pedido (cambia su estado a CANCELADO).
function cancelarPedido(id) {
  const pedidos = leer(CLAVES.pedidos, []);
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  pedido.estado = 'CANCELADO';
  guardar(CLAVES.pedidos, pedidos);
  renderizarPedidos();
  renderizarDashboard();
  mostrarToast('Pedido #' + String(id).padStart(4, '0') + ' cancelado.', 'info');
}

// Elimina un pedido por completo.
function eliminarPedido(id) {
  const confirmar = confirm('¿Eliminar el pedido #' + String(id).padStart(4, '0') + '?');
  if (!confirmar) return;

  const pedidos = leer(CLAVES.pedidos, []).filter(p => p.id !== id);
  guardar(CLAVES.pedidos, pedidos);
  renderizarPedidos();
  renderizarDashboard();
  mostrarToast('Pedido eliminado.', 'exito');
}

/* ============================ PRODUCTOS ================================== */

// Llena el selector de imágenes con las disponibles en la carpeta img/.
function llenarSelectImagenes() {
  const select = $('#prod-imagen');
  select.innerHTML = '';
  IMAGENES_DISPONIBLES.forEach(imagen => {
    const opcion = document.createElement('option');
    opcion.value = imagen;
    opcion.textContent = imagen.replace('img/', '');
    select.appendChild(opcion);
  });
}

// Dibuja la tabla de productos.
function renderizarProductos() {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const nombresCategoria = { hotdog: 'Hot Dogs', hamburguesa: 'Hamburguesas', complemento: 'Complementos' };

  let html = '';
  productos.forEach(producto => {
    const disponible = producto.disponible !== false
      ? '<span class="insignia insignia-verde">Disponible</span>'
      : '<span class="insignia insignia-gris">Agotado</span>';

    html +=
      '<tr>' +
      '  <td><img class="thumb-img" src="' + producto.img + '" alt=""></td>' +
      '  <td><strong>' + producto.nombre + '</strong></td>' +
      '  <td>' + (nombresCategoria[producto.categoria] || producto.categoria) + '</td>' +
      '  <td>' + formatearPrecio(producto.precio) + '</td>' +
      '  <td>' + disponible + '</td>' +
      '  <td>' +
      '    <button class="btn-accion editar" onclick="editarProducto(' + producto.id + ')">Editar</button> ' +
      '    <button class="btn-accion eliminar" onclick="eliminarProducto(' + producto.id + ')">Eliminar</button>' +
      '  </td>' +
      '</tr>';
  });
  $('#cuerpo-productos').innerHTML = html;
}

// Guarda un producto nuevo o editado.
function guardarProducto(evento) {
  evento.preventDefault();

  const nombre = $('#prod-nombre').value.trim();
  const descripcion = $('#prod-descripcion').value.trim();
  const precio = parseFloat($('#prod-precio').value);
  const idEditar = parseInt($('#prod-id').value, 10);

  if (!nombre || !descripcion || isNaN(precio) || precio < 0) {
    mostrarToast('Completa todos los campos correctamente.', 'error');
    return false;
  }

  const datos = {
    nombre: nombre,
    categoria: $('#prod-categoria').value,
    descripcion: descripcion,
    precio: precio,
    img: $('#prod-imagen').value || $('#prod-imagen').dataset.predeterminada,
    disponible: $('#prod-disponible').checked,
    costo: Math.round(precio * 0.45) // costo estimado para los reportes
  };

  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);

  if (idEditar) {
    const indice = productos.findIndex(p => p.id === idEditar);
    if (indice >= 0) {
      productos[indice] = Object.assign(productos[indice], datos);
      mostrarToast('Producto actualizado.', 'exito');
    }
  } else {
    datos.id = siguienteId(productos);
    datos.ingredientes = [];
    productos.push(datos);
    mostrarToast('Producto registrado.', 'exito');
  }

  guardar(CLAVES.productos, productos);
  cancelarEdicionProducto();
  renderizarProductos();
  return false;
}

// Llena el formulario con los datos de un producto para editarlo.
function editarProducto(id) {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  $('#prod-id').value = producto.id;
  $('#prod-nombre').value = producto.nombre;
  $('#prod-categoria').value = producto.categoria;
  $('#prod-precio').value = producto.precio;
  $('#prod-descripcion').value = producto.descripcion;
  $('#prod-imagen').value = producto.img;
  $('#prod-disponible').checked = producto.disponible !== false;
  $('#titulo-form-producto').textContent = 'Editar producto';

  document.querySelector('#seccion-productos .admin-formulario')
    .scrollIntoView({ behavior: 'smooth' });
}

// Restablece el formulario de producto.
function cancelarEdicionProducto() {
  $('#form-producto').reset();
  $('#prod-id').value = '';
  $('#prod-disponible').checked = true;
  $('#titulo-form-producto').textContent = 'Nuevo producto';
}

// Elimina un producto.
function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT).filter(p => p.id !== id);
  guardar(CLAVES.productos, productos);
  renderizarProductos();
  mostrarToast('Producto eliminado.', 'exito');
}

/* =========================== INGREDIENTES ================================ */

// Dibuja la tabla de ingredientes con sus alertas de stock.
function renderizarIngredientes() {
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);

  let html = '';
  ingredientes.forEach(ing => {
    const bajo = ing.cantidad <= ing.minimo;
    const estado = bajo
      ? '<span class="alerta-bajo">INVENTARIO BAJO</span>'
      : '<span class="insignia insignia-verde">Suficiente</span>';

    html +=
      '<tr>' +
      '  <td><strong>' + ing.nombre + '</strong></td>' +
      '  <td>' + ing.cantidad + '</td>' +
      '  <td>' + ing.unidad + '</td>' +
      '  <td>' + ing.minimo + '</td>' +
      '  <td>' + estado + '</td>' +
      '  <td>' +
      '    <button class="btn-accion ver" onclick="ajustarStock(' + ing.id + ', 1)">+ Stock</button> ' +
      '    <button class="btn-accion cancelar" onclick="ajustarStock(' + ing.id + ', 0)">- Stock</button> ' +
      '    <button class="btn-accion editar" onclick="editarIngrediente(' + ing.id + ')">Editar</button> ' +
      '    <button class="btn-accion eliminar" onclick="eliminarIngrediente(' + ing.id + ')">Eliminar</button>' +
      '  </td>' +
      '</tr>';
  });
  $('#cuerpo-ingredientes').innerHTML = html;
}

// Aumenta o disminuye el stock de un ingrediente (tipo 1 = entrada, 0 = salida).
function ajustarStock(id, tipo) {
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  const ing = ingredientes.find(i => i.id === id);
  if (!ing) return;

  const cantidadTexto = prompt(
    (tipo ? 'ENTRADA' : 'SALIDA') + ' — ' + ing.nombre + ': ¿cuántas/unidades ' + ing.unidad + '?',
    '1');
  if (cantidadTexto === null) return;

  const cantidad = parseFloat(cantidadTexto);
  if (isNaN(cantidad) || cantidad <= 0) {
    mostrarToast('Ingresa una cantidad válida.', 'error');
    return;
  }

  if (tipo) {
    ing.cantidad += cantidad;
  } else {
    ing.cantidad = Math.max(0, ing.cantidad - cantidad);
  }
  ing.cantidad = Math.round(ing.cantidad * 1000) / 1000;
  guardar(CLAVES.ingredientes, ingredientes);

  // Registra el movimiento en el almacén.
  const movimientos = leer(CLAVES.inventario, []);
  movimientos.push({
    id: siguienteId(movimientos),
    fecha: formatoFechaLocal(new Date()),
    ingrediente: ing.nombre,
    tipo: tipo ? 'entrada' : 'salida',
    cantidad: cantidad,
    unidad: ing.unidad,
    motivo: 'Ajuste manual de inventario'
  });
  guardar(CLAVES.inventario, movimientos);

  renderizarIngredientes();
  renderizarMovimientos();
  llenarSelectIngredientes();
  mostrarToast('Stock actualizado: ' + ing.nombre + '.', 'exito');
}

// Guarda un ingrediente nuevo o editado.
function guardarIngrediente(evento) {
  evento.preventDefault();

  const nombre = $('#ing-nombre').value.trim();
  const cantidad = parseFloat($('#ing-cantidad').value);
  const minimo = parseFloat($('#ing-minimo').value);
  const idEditar = parseInt($('#ing-id').value, 10);

  if (!nombre || isNaN(cantidad) || cantidad < 0 || isNaN(minimo) || minimo < 0) {
    mostrarToast('Completa todos los campos correctamente.', 'error');
    return false;
  }

  const datos = {
    nombre: nombre,
    cantidad: cantidad,
    unidad: $('#ing-unidad').value,
    minimo: minimo
  };

  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);

  if (idEditar) {
    const indice = ingredientes.findIndex(i => i.id === idEditar);
    if (indice >= 0) {
      ingredientes[indice] = Object.assign(ingredientes[indice], datos);
      mostrarToast('Ingrediente actualizado.', 'exito');
    }
  } else {
    datos.id = siguienteId(ingredientes);
    ingredientes.push(datos);
    mostrarToast('Ingrediente registrado.', 'exito');
  }

  guardar(CLAVES.ingredientes, ingredientes);
  cancelarEdicionIngrediente();
  renderizarIngredientes();
  llenarSelectIngredientes();
  return false;
}

// Llena el formulario con los datos de un ingrediente.
function editarIngrediente(id) {
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  const ing = ingredientes.find(i => i.id === id);
  if (!ing) return;

  $('#ing-id').value = ing.id;
  $('#ing-nombre').value = ing.nombre;
  $('#ing-cantidad').value = ing.cantidad;
  $('#ing-unidad').value = ing.unidad;
  $('#ing-minimo').value = ing.minimo;
  $('#titulo-form-ingrediente').textContent = 'Editar ingrediente';
  document.querySelector('#seccion-ingredientes .admin-formulario')
    .scrollIntoView({ behavior: 'smooth' });
}

// Restablece el formulario de ingrediente.
function cancelarEdicionIngrediente() {
  $('#form-ingrediente').reset();
  $('#ing-id').value = '';
  $('#titulo-form-ingrediente').textContent = 'Nuevo ingrediente';
}

// Elimina un ingrediente.
function eliminarIngrediente(id) {
  if (!confirm('¿Eliminar este ingrediente?')) return;
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT).filter(i => i.id !== id);
  guardar(CLAVES.ingredientes, ingredientes);
  renderizarIngredientes();
  llenarSelectIngredientes();
  mostrarToast('Ingrediente eliminado.', 'exito');
}

/* ============================ INVENTARIO ================================= */

// Llena el selector de ingredientes del formulario de movimiento.
function llenarSelectIngredientes() {
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  const select = $('#inv-ingrediente');

  if (select) {
    select.innerHTML = '';
    ingredientes.forEach(ing => {
      const opcion = document.createElement('option');
      opcion.value = ing.id;
      opcion.textContent = ing.nombre + ' (' + ing.cantidad + ' ' + ing.unidad + ')';
      select.appendChild(opcion);
    });
  }
}

// Dibuja la tabla de movimientos del almacén.
function renderizarMovimientos() {
  const movimientos = leer(CLAVES.inventario, [])
    .slice()
    .sort((a, b) => b.id - a.id);

  const cuerpo = $('#cuerpo-inventario');
  if (movimientos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="5">No hay movimientos registrados.</td></tr>';
    return;
  }

  let html = '';
  movimientos.forEach(mov => {
    const insignia = mov.tipo === 'entrada'
      ? '<span class="insignia insignia-verde">ENTRADA</span>'
      : '<span class="insignia insignia-roja">SALIDA</span>';
    html +=
      '<tr>' +
      '  <td>' + formatearFechaHora(mov.fecha) + '</td>' +
      '  <td>' + mov.ingrediente + '</td>' +
      '  <td>' + insignia + '</td>' +
      '  <td>' + mov.cantidad + ' ' + mov.unidad + '</td>' +
      '  <td>' + mov.motivo + '</td>' +
      '</tr>';
  });
  cuerpo.innerHTML = html;
}

// Registra una entrada o salida de almacén.
function registrarMovimiento(evento) {
  evento.preventDefault();

  const ingId = parseInt($('#inv-ingrediente').value, 10);
  const tipo = $('#inv-tipo').value;
  const cantidad = parseFloat($('#inv-cantidad').value);
  const motivo = $('#inv-motivo').value.trim();

  if (isNaN(cantidad) || cantidad <= 0 || !motivo) {
    mostrarToast('Ingresa una cantidad válida y el motivo.', 'error');
    return false;
  }

  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  const ing = ingredientes.find(i => i.id === ingId);
  if (!ing) return false;

  if (tipo === 'salida') {
    ing.cantidad = Math.max(0, ing.cantidad - cantidad);
  } else {
    ing.cantidad += cantidad;
  }
  ing.cantidad = Math.round(ing.cantidad * 1000) / 1000;

  const movimientos = leer(CLAVES.inventario, []);
  movimientos.push({
    id: siguienteId(movimientos),
    fecha: formatoFechaLocal(new Date()),
    ingrediente: ing.nombre,
    tipo: tipo,
    cantidad: cantidad,
    unidad: ing.unidad,
    motivo: motivo
  });

  guardar(CLAVES.ingredientes, ingredientes);
  guardar(CLAVES.inventario, movimientos);

  $('#form-inventario').reset();
  llenarSelectIngredientes();
  renderizarMovimientos();
  renderizarIngredientes();
  mostrarToast(tipo === 'entrada' ? 'Entrada registrada.' : 'Salida registrada.', 'exito');
  return false;
}

/* ============================== VENTAS =================================== */

// Muestra el resumen de ventas por periodo, categoría y método de pago.
function renderizarVentas() {
  // Tarjetas de ventas por periodo.
  const ventasHoy = calcularReporte('hoy');
  const ventasSemana = calcularReporte('semana');
  const ventasMes = calcularReporte('mes');

  $('#venta-dia').textContent = formatearPrecio(ventasHoy.ventas);
  $('#venta-semana').textContent = formatearPrecio(ventasSemana.ventas);
  $('#venta-mes').textContent = formatearPrecio(ventasMes.ventas);

  // Ventas del día por categoría.
  const categorias = [
    { clave: 'hotdog', nombre: 'Hot Dogs' },
    { clave: 'hamburguesa', nombre: 'Hamburguesas' },
    { clave: 'complemento', nombre: 'Complementos y bebidas' }
  ];
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);

  const hoy = diaActualTexto();
  const entregados = leer(CLAVES.pedidos, [])
    .filter(p => p.estado === 'ENTREGADO' && entreFechas(p.fecha, hoy, hoy));

  let totalCategorias = 0;
  let htmlCat = '<ul class="lista-detalle">';
  categorias.forEach(categoria => {
    let total = 0;
    entregados.forEach(pedido => {
      pedido.items.forEach(linea => {
        const producto = productos.find(p => p.id === linea.productoId);
        if (producto && producto.categoria === categoria.clave) total += linea.subtotal;
      });
    });
    totalCategorias += total;
    htmlCat +=
      '<li><span>' + categoria.nombre + '</span><span>' + formatearPrecio(total) + '</span></li>';
  });
  htmlCat += '<li class="total"><span>TOTAL</span><span>' + formatearPrecio(totalCategorias) + '</span></li></ul>';
  $('#ventas-categorias').innerHTML = htmlCat;

  // Métodos de pago utilizados hoy.
  const conteoPagos = {};
  entregados.forEach(pedido => {
    conteoPagos[pedido.pago] = (conteoPagos[pedido.pago] || 0) + 1;
  });

  let htmlPagos = '<ul class="lista-detalle">';
  Object.keys(conteoPagos).forEach(metodo => {
    htmlPagos +=
      '<li><span>' + metodo + '</span><span>' + conteoPagos[metodo] + ' pedido(s)</span></li>';
  });
  htmlPagos += '<li class="total"><span>Total</span><span>' + entregados.length + ' pedidos</span></li></ul>';
  $('#ventas-pagos').innerHTML = htmlPagos;
}

/* ============================= REPORTES ================================== */

// Genera y muestra el reporte del periodo seleccionado.
function generarReporte(mostrar) {
  const periodo = $('#reporte-periodo').value;
  const reporte = calcularReporte(periodo);

  const nombrePeriodo = { hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes' }[periodo];

  $('#reporte-resultado').innerHTML =
    '<h3>Reporte — ' + nombrePeriodo + '</h3>' +
    '<ul class="lista-detalle">' +
    '<li><span>Total de ventas</span><span>' + formatearPrecio(reporte.ventas) + '</span></li>' +
    '<li><span>Número de pedidos</span><span>' + reporte.pedidos.length + '</span></li>' +
    '<li><span>Productos vendidos</span><span>' + reporte.productosVendidos + '</span></li>' +
    '<li><span>Costo de ingredientes</span><span>' + formatearPrecio(reporte.costoIngredientes) + '</span></li>' +
    '<li><span>Pagos al personal</span><span>' + formatearPrecio(reporte.pagosPersonal) + '</span></li>' +
    '<li><span>Otros gastos</span><span>' + formatearPrecio(reporte.otrosGastos) + '</span></li>' +
    '<li class="total"><span>UTILIDAD</span><span>' + formatearPrecio(reporte.utilidad) + '</span></li>' +
    '</ul>';

  $('#reporte-resultado').style.display = 'block';
  mostrarToast('Reporte generado.', 'exito');
}

// Imprime el reporte generado.
function imprimirReporte() {
  if ($('#reporte-resultado').style.display === 'none') generarReporte(true);
  window.print();
}

/* ============================ UTILIDADES ================================= */

// Muestra el desglose de la utilidad del periodo elegido.
function renderizarUtilidades() {
  const periodo = $('#utilidad-periodo').value;
  const reporte = calcularReporte(periodo);

  const nombrePeriodo = { hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes' }[periodo];

  $('#utilidad-resultado').innerHTML =
    '<h3>Utilidades — ' + nombrePeriodo + '</h3>' +
    '<ul class="lista-detalle">' +
    '<li><span>Ventas</span><span>' + formatearPrecio(reporte.ventas) + '</span></li>' +
    '<li><span>Costo de ingredientes</span><span>-' + formatearPrecio(reporte.costoIngredientes) + '</span></li>' +
    '<li><span>Pagos al personal</span><span>-' + formatearPrecio(reporte.pagosPersonal) + '</span></li>' +
    '<li><span>Otros gastos</span><span>-' + formatearPrecio(reporte.otrosGastos) + '</span></li>' +
    '<li class="total"><span>UTILIDAD TOTAL</span><span>' + formatearPrecio(reporte.utilidad) + '</span></li>' +
    '</ul>';
}

/* ============================== PERSONAL ================================= */

// Dibuja la tabla de empleados.
function renderizarPersonal() {
  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);

  let html = '';
  empleados.forEach(emp => {
    const insignia = emp.estado === 'Activo'
      ? '<span class="insignia insignia-verde">Activo</span>'
      : '<span class="insignia insignia-gris">Inactivo</span>';
    html +=
      '<tr>' +
      '  <td><strong>' + emp.nombre + '</strong></td>' +
      '  <td>' + emp.puesto + '</td>' +
      '  <td>' + emp.telefono + '</td>' +
      '  <td>' + formatearPrecio(emp.pagoDia) + '</td>' +
      '  <td>' + insignia + '</td>' +
      '  <td>' +
      '    <button class="btn-accion editar" onclick="editarEmpleado(' + emp.id + ')">Editar</button> ' +
      '    <button class="btn-accion eliminar" onclick="eliminarEmpleado(' + emp.id + ')">Eliminar</button>' +
      '  </td>' +
      '</tr>';
  });
  $('#cuerpo-personal').innerHTML = html;
}

// Guarda un empleado nuevo o editado.
function guardarEmpleado(evento) {
  evento.preventDefault();

  const nombre = $('#emp-nombre').value.trim();
  const puesto = $('#emp-puesto').value.trim();
  const telefono = $('#emp-telefono').value.trim();
  const pagoDia = parseFloat($('#emp-pago').value);
  const idEditar = parseInt($('#emp-id').value, 10);

  if (!nombre || !puesto || !telefonoValido(telefono) || isNaN(pagoDia) || pagoDia < 0) {
    mostrarToast('Completa todos los campos (teléfono de 10 a 15 dígitos).', 'error');
    return false;
  }

  const datos = {
    nombre: nombre,
    puesto: puesto,
    telefono: telefono,
    pagoDia: pagoDia,
    estado: $('#emp-estado').value
  };

  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);

  if (idEditar) {
    const indice = empleados.findIndex(e => e.id === idEditar);
    if (indice >= 0) {
      empleados[indice] = Object.assign(empleados[indice], datos);
      mostrarToast('Empleado actualizado.', 'exito');
    }
  } else {
    datos.id = siguienteId(empleados);
    empleados.push(datos);
    mostrarToast('Empleado registrado.', 'exito');
  }

  guardar(CLAVES.empleados, empleados);
  cancelarEdicionEmpleado();
  renderizarPersonal();
  llenarSelectEmpleados();
  return false;
}

// Llena el formulario con los datos de un empleado.
function editarEmpleado(id) {
  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);
  const emp = empleados.find(e => e.id === id);
  if (!emp) return;

  $('#emp-id').value = emp.id;
  $('#emp-nombre').value = emp.nombre;
  $('#emp-puesto').value = emp.puesto;
  $('#emp-telefono').value = emp.telefono;
  $('#emp-pago').value = emp.pagoDia;
  $('#emp-estado').value = emp.estado;
  $('#titulo-form-empleado').textContent = 'Editar empleado';
  document.querySelector('#seccion-personal .admin-formulario')
    .scrollIntoView({ behavior: 'smooth' });
}

// Restablece el formulario de empleado.
function cancelarEdicionEmpleado() {
  $('#form-empleado').reset();
  $('#emp-id').value = '';
  $('#emp-estado').value = 'Activo';
  $('#titulo-form-empleado').textContent = 'Registrar empleado';
}

// Elimina un empleado.
function eliminarEmpleado(id) {
  if (!confirm('¿Eliminar este empleado?')) return;
  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT).filter(e => e.id !== id);
  guardar(CLAVES.empleados, empleados);
  renderizarPersonal();
  llenarSelectEmpleados();
  mostrarToast('Empleado eliminado.', 'exito');
}

/* ============================ PAGOS ====================================== */

// Llena los selectores de empleado (formulario y filtro).
function llenarSelectEmpleados() {
  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);

  const selectForm = $('#pago-empleado');
  selectForm.innerHTML = '';
  empleados.forEach(emp => {
    const opcion = document.createElement('option');
    opcion.value = emp.id;
    opcion.textContent = emp.nombre + ' — ' + emp.puesto;
    selectForm.appendChild(opcion);
  });
  // Al llenar, muestra los datos del primer empleado.
  if (empleados.length > 0) actualizarDatosEmpleado();

  const selectFiltro = $('#filtro-pago-empleado');
  selectFiltro.innerHTML = '<option value="">Todos</option>';
  empleados.forEach(emp => {
    const opcion = document.createElement('option');
    opcion.value = emp.nombre;
    opcion.textContent = emp.nombre;
    selectFiltro.appendChild(opcion);
  });
}

// Al elegir un empleado, copia su puesto y pago por día al formulario.
function actualizarDatosEmpleado() {
  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);
  const emp = empleados.find(e => e.id === parseInt($('#pago-empleado').value, 10));
  if (!emp) return;
  $('#pago-puesto').value = emp.puesto;
  $('#pago-pdias').value = emp.pagoDia;
  actualizarTotalPago();
}

// Calcula el total del pago: días × pago por día.
function actualizarTotalPago() {
  const dias = parseFloat($('#pago-dias').value) || 0;
  const pagoDia = parseFloat($('#pago-pdias').value) || 0;
  $('#pago-total').textContent = formatearPrecio(dias * pagoDia);
}

// Guarda un pago nuevo o editado.
function guardarPago(evento) {
  evento.preventDefault();

  const empleados = leer(CLAVES.empleados, EMPLEADOS_DEFAULT);
  const empId = parseInt($('#pago-empleado').value, 10);
  const emp = empleados.find(e => e.id === empId);
  const dias = parseFloat($('#pago-dias').value);
  const pagoDia = parseFloat($('#pago-pdias').value);
  const fecha = $('#pago-fecha').value;
  const idEditar = parseInt($('#pago-id').value, 10);

  if (!emp || isNaN(dias) || dias <= 0 || isNaN(pagoDia) || pagoDia < 0 || !fecha) {
    mostrarToast('Completa todos los campos correctamente.', 'error');
    return false;
  }

  const datos = {
    empleadoId: emp.id,
    empleado: emp.nombre,
    puesto: emp.puesto,
    dias: dias,
    pagoDia: pagoDia,
    total: dias * pagoDia,
    estado: $('#pago-estado').value,
    fecha: fecha
  };

  const pagos = leer(CLAVES.pagos, []);

  if (idEditar) {
    const indice = pagos.findIndex(p => p.id === idEditar);
    if (indice >= 0) {
      // Conserva el empleado original si solo se editó el importe.
      pagos[indice] = Object.assign(pagos[indice], datos);
      mostrarToast('Pago actualizado.', 'exito');
    }
  } else {
    datos.id = siguienteId(pagos);
    pagos.push(datos);
    mostrarToast('Pago registrado.', 'exito');
  }

  guardar(CLAVES.pagos, pagos);
  cancelarEdicionPago();
  renderizarPagos();
  return false;
}

// Dibuja la tabla de pagos con sus filtros.
function renderizarPagos() {
  const filtroEmpleado = $('#filtro-pago-empleado').value;
  const filtroFecha = $('#filtro-pago-fecha').value;

  let pagos = leer(CLAVES.pagos, [])
    .slice()
    .sort((a, b) => b.id - a.id);

  if (filtroEmpleado) pagos = pagos.filter(p => p.empleado === filtroEmpleado);
  if (filtroFecha) pagos = pagos.filter(p => (p.fecha || '').slice(0, 10) === filtroFecha);

  const cuerpo = $('#cuerpo-pagos');
  if (pagos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="8">No hay pagos que mostrar.</td></tr>';
    return;
  }

  let html = '';
  pagos.forEach(pago => {
    const insignia = pago.estado === 'PAGADO'
      ? '<span class="insignia insignia-verde">PAGADO</span>'
      : '<span class="insignia insignia-ambar">PENDIENTE</span>';
    html +=
      '<tr>' +
      '  <td>' + pago.empleado + '</td>' +
      '  <td>' + pago.puesto + '</td>' +
      '  <td>' + pago.dias + '</td>' +
      '  <td>' + formatearPrecio(pago.pagoDia) + '</td>' +
      '  <td><strong>' + formatearPrecio(pago.total) + '</strong></td>' +
      '  <td>' + insignia + '</td>' +
      '  <td>' + formatearFecha(pago.fecha) + '</td>' +
      '  <td>' +
      '    <button class="btn-accion editar" onclick="editarPago(' + pago.id + ')">Editar</button> ' +
      '    <button class="btn-accion eliminar" onclick="eliminarPago(' + pago.id + ')">Eliminar</button>' +
      '  </td>' +
      '</tr>';
  });
  cuerpo.innerHTML = html;
}

// Llena el formulario con los datos de un pago.
function editarPago(id) {
  const pagos = leer(CLAVES.pagos, []);
  const pago = pagos.find(p => p.id === id);
  if (!pago) return;

  $('#pago-id').value = pago.id;
  $('#pago-empleado').value = pago.empleadoId || '';
  actualizarDatosEmpleado();
  $('#pago-dias').value = pago.dias;
  $('#pago-pdias').value = pago.pagoDia;
  $('#pago-estado').value = pago.estado;
  $('#pago-fecha').value = (pago.fecha || '').slice(0, 10);
  actualizarTotalPago();
  $('#titulo-form-pago').textContent = 'Editar pago';
  document.querySelector('#seccion-pagos .admin-formulario')
    .scrollIntoView({ behavior: 'smooth' });
}

// Restablece el formulario de pago.
function cancelarEdicionPago() {
  $('#form-pago').reset();
  $('#pago-id').value = '';
  $('#pago-fecha').value = diaActualTexto();
  actualizarDatosEmpleado();
  $('#titulo-form-pago').textContent = 'Registrar pago';
}

// Elimina un pago.
function eliminarPago(id) {
  if (!confirm('¿Eliminar este pago?')) return;
  const pagos = leer(CLAVES.pagos, []).filter(p => p.id !== id);
  guardar(CLAVES.pagos, pagos);
  renderizarPagos();
  mostrarToast('Pago eliminado.', 'exito');
}

/* ========================== INICIALIZACIÓN =============================== */

document.addEventListener('DOMContentLoaded', () => {
  // Protección: si no hay sesión, se regresa al login.
  if (!leer(CLAVES.sesion, false)) {
    window.location.replace('login.html');
    return;
  }

  // Fecha actual en la cabecera.
  $('#fecha-admin').textContent =
    'Hoy: ' + new Date().toLocaleDateString('es-MX');

  // Preparación de los formularios.
  llenarSelectImagenes();
  llenarSelectIngredientes();
  llenarSelectEmpleados();
  $('#pago-fecha').value = diaActualTexto();
  actualizarDatosEmpleado();

  // Muestra la primera sección.
  mostrarSeccion('dashboard');
});