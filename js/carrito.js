/* ==========================================================================
   js/carrito.js  —  Lógica del carrito de compras.

   El carrito se guarda en localStorage (clave 'hde_carrito') para que no se
   pierda al cambiar de página. Contiene una lista de líneas del carrito:

   {
     productoId: id del producto,
     nombre:     nombre del producto,
     img:        imagen del producto,
     extras:     [nombres de los ingredientes adicionales],
     precioUnitario: precio base + extras,
     cantidad:   cuántas unidades,
     subtotal:   precioUnitario * cantidad
   }
   ========================================================================== */

'use strict';

/* ----------------------------- Lectura ---------------------------------- */

// Devuelve el carrito guardado (o uno vacío).
function leerCarrito() {
  return leer(CLAVES.carrito, []);
}

// Guarda el carrito y actualiza el contador de la navegación.
function guardarCarrito(carrito) {
  guardar(CLAVES.carrito, carrito);
  actualizarContadorCarrito();
}

/* --------------------------- Operaciones -------------------------------- */

// Agrega un producto al carrito. Si ya existe una línea igual (mismo producto
// y mismos extras), solo aumenta la cantidad.
function agregarAlCarrito(producto, extras, cantidad) {
  const carrito = leerCarrito();

  const precioExtra = extras.reduce((total, extra) => total + extra.precio, 0);
  const lineaNueva = {
    productoId: producto.id,
    nombre: producto.nombre,
    img: producto.img,
    extras: extras.map(extra => extra.nombre),
    precioUnitario: producto.precio + precioExtra,
    cantidad: cantidad,
    subtotal: (producto.precio + precioExtra) * cantidad
  };

  // Compara el arreglo de extras ignorando el orden.
  const extrasNueva = lineaNueva.extras.slice().sort().join('|');
  const indice = carrito.findIndex(linea => {
    const extrasExistente = linea.extras.slice().sort().join('|');
    return linea.productoId === lineaNueva.productoId &&
           extrasExistente === extrasNueva;
  });

  if (indice >= 0) {
    carrito[indice].cantidad += cantidad;
    carrito[indice].subtotal = carrito[indice].precioUnitario * carrito[indice].cantidad;
  } else {
    carrito.push(lineaNueva);
  }

  guardarCarrito(carrito);
  return lineaNueva;
}

// Cambia la cantidad de una línea. delta puede ser +1 o -1.
// La cantidad mínima es 1.
function cambiarCantidad(indice, delta) {
  const carrito = leerCarrito();
  const linea = carrito[indice];
  if (!linea) return;

  linea.cantidad = Math.max(1, linea.cantidad + delta);
  linea.subtotal = linea.precioUnitario * linea.cantidad;
  guardarCarrito(carrito);
  renderizarCarrito();
}

// Elimina una línea completa del carrito.
function eliminarDelCarrito(indice) {
  const carrito = leerCarrito();
  carrito.splice(indice, 1);
  guardarCarrito(carrito);
  renderizarCarrito();
}

// Suma el total de todos los subtotales.
function totalCarrito() {
  return leerCarrito().reduce((total, linea) => total + linea.subtotal, 0);
}

// Vuelca el carrito (se usa al confirmar un pedido).
function vaciarCarrito() {
  guardarCarrito([]);
}

/* --------------------------- Presentación ------------------------------- */

// Dibuja las líneas del carrito en la página carrito.html.
function renderizarCarrito() {
  const contenedor = $('#lineas-carrito');
  if (!contenedor) return; // Esta página no muestra el carrito.

  const carrito = leerCarrito();

  // Caso 1: el carrito está vacío.
  if (carrito.length === 0) {
    contenedor.innerHTML =
      '<div class="carrito-vacio">' +
      '  <p>Tu carrito está vacío.</p>' +
      '  <a href="menu.html" class="btn btn-primario">VER MENÚ</a>' +
      '</div>';
    $('#resumen-compra').style.display = 'none';
    return;
  }

  // Caso 2: hay productos, se construye el HTML de cada línea.
  let html = '';
  carrito.forEach((linea, indice) => {
    const extrasHtml = linea.extras.length
      ? '<div class="linea-extras">' + linea.extras.join(' + ') + '</div>'
      : '';
    html +=
      '<div class="linea-carrito">' +
      '  <img src="' + linea.img + '" alt="' + linea.nombre + '">' +
      '  <div class="linea-info">' +
      '    <h4>' + linea.nombre + '</h4>' +
             extrasHtml +
      '    <span class="linea-precio-unitario">Precio: ' + formatearPrecio(linea.precioUnitario) + '</span>' +
      '  </div>' +
      '  <div class="linea-cantidad">' +
      '    <button class="btn-cant" onclick="cambiarCantidad(' + indice + ', -1)">−</button>' +
      '    <span>' + linea.cantidad + '</span>' +
      '    <button class="btn-cant" onclick="cambiarCantidad(' + indice + ', 1)">+</button>' +
      '  </div>' +
      '  <div class="linea-subtotal">' +
      '    <span>' + formatearPrecio(linea.subtotal) + '</span>' +
      '    <button class="btn-eliminar" onclick="eliminarDelCarrito(' + indice + ')">Eliminar</button>' +
      '  </div>' +
      '</div>';
  });
  contenedor.innerHTML = html;

  // Muestra los totales.
  $('#resumen-compra').style.display = 'block';
  $('#total-productos').textContent = formatearPrecio(totalCarrito());
  const total = totalCarrito() + ENVIO;
  $('#total-pedido').textContent = formatearPrecio(total);
}