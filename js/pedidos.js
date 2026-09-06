/* ==========================================================================
   js/pedidos.js  —  Sistema de pedidos.

   Funciones:
   1. Mostrar el resumen del pedido con los productos del carrito.
   2. Validar el formulario (nombre, teléfono, dirección y pago).
   3. Guardar el pedido en localStorage con estado "PENDIENTE".
   4. Simular el descuento de ingredientes del inventario al confirmar.
   5. Mostrar la pantalla de "¡PEDIDO REALIZADO!".
   ========================================================================== */

'use strict';

/* --------------------- Resumen del pedido ------------------------------- */

// Dibuja el resumen con los artículos del carrito.
function renderizarResumen() {
  const carrito = leerCarrito();
  const vacio = $('#pedido-vacio');
  const principal = $('#pedido-principal');

  // Si el carrito está vacío, mostramos el aviso en lugar del formulario.
  if (carrito.length === 0) {
    vacio.style.display = 'block';
    principal.style.display = 'none';
    return;
  }
  vacio.style.display = 'none';
  principal.style.display = 'grid';

  // Lista de artículos.
  let html = '';
  carrito.forEach(linea => {
    const extras = linea.extras.length > 0
      ? '<small>' + linea.extras.join(' + ') + ' · ' + linea.cantidad + ' pz</small>'
      : '<small>' + linea.cantidad + ' pz</small>';
    html +=
      '<div class="resumen-linea">' +
      '  <span>' + linea.nombre + extras + '</span>' +
      '  <span>' + formatearPrecio(linea.subtotal) + '</span>' +
      '</div>';
  });
  $('#resumen-articulos').innerHTML = html;

  // Totales.
  const subtotal = totalCarrito();
  $('#resumen-subtotal').textContent = formatearPrecio(subtotal);
  $('#resumen-total').textContent = formatearPrecio(subtotal + ENVIO);
}

/* ------------------------ Validación del formulario ---------------------- */

// Muestra u oculta el mensaje de error de un campo.
function marcarError(idError, activo) {
  const campo = $('#' + idError);
  if (campo) campo.style.display = activo ? 'block' : 'none';
  return !activo;
}

// Devuelve true solo si todo el formulario es correcto.
function formularioValido() {
  const nombre = $('#campo-nombre').value.trim();
  const telefono = $('#campo-telefono').value.trim();
  const direccion = $('#campo-direccion').value.trim();
  const pagoMarcado = document.querySelector('input[name="pago"]:checked');

  let correcto = true;
  correcto = marcarError('error-nombre', nombre === '') && correcto;
  correcto = marcarError('error-telefono', !telefonoValido(telefono)) && correcto;
  correcto = marcarError('error-direccion', direccion === '') && correcto;
  correcto = marcarError('error-pago', !pagoMarcado) && correcto;
  return correcto;
}

/* ----------------------- Confirmación del pedido ------------------------- */

// Se llama al enviar el formulario (botón CONFIRMAR PEDIDO).
function confirmarPedido(evento) {
  evento.preventDefault();

  if (!formularioValido()) {
    mostrarToast('Revisa los campos marcados en rojo.', 'error');
    return false;
  }

  const carrito = leerCarrito();
  const pedidos = leer(CLAVES.pedidos, []);
  const subtotal = totalCarrito();

  const pago = document.querySelector('input[name="pago"]:checked');

  // Crea el objeto del pedido.
  const pedido = {
    id: siguienteId(pedidos),
    cliente: $('#campo-nombre').value.trim(),
    telefono: $('#campo-telefono').value.trim(),
    direccion: $('#campo-direccion').value.trim(),
    referencias: $('#campo-referencias').value.trim(),
    pago: pago.value,
    comentarios: $('#campo-comentarios').value.trim(),
    items: carrito,
    subtotal: subtotal,
    envio: ENVIO,
    total: subtotal + ENVIO,
    estado: 'PENDIENTE',
    fecha: formatoFechaLocal(new Date())
  };

  // Guarda el pedido.
  pedidos.push(pedido);
  guardar(CLAVES.pedidos, pedidos);

  // Simula la salida de ingredientes del almacén por esta venta.
  descontarIngredientesDePedido(pedido);

  // Vacía el carrito y muestra la confirmación.
  vaciarCarrito();
  mostrarConfirmacion(pedido);
  return false;
}

// Muestra la pantalla de "¡PEDIDO REALIZADO!" con el número del pedido.
function mostrarConfirmacion(pedido) {
  $('#pedido-principal').style.display = 'none';
  $('#confirmacion-pedido').style.display = 'block';

  $('#conf-numero').textContent = '#' + String(pedido.id).padStart(4, '0');
  $('#conf-total').textContent = formatearPrecio(pedido.total);

  mostrarToast('Pedido realizado correctamente.', 'exito');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------ Descuento de ingredientes ---------------------------- */

// Suma una cantidad al mapa de consumos de un producto.
function sumarConsumo(mapa, nombre, cantidad) {
  mapa[nombre] = (mapa[nombre] || 0) + cantidad;
}

// Calcula los ingredientes que consume cada línea del pedido y los descuenta
// del inventario. También registra cada movimiento en el almacén.
function descontarIngredientesDePedido(pedido) {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const ingredientes = leer(CLAVES.ingredientes, INGREDIENTES_DEFAULT);
  const movimientos = leer(CLAVES.inventario, []);

  // 1) Calcular cuánto de cada ingrediente se necesita.
  const consumos = [];

  pedido.items.forEach(linea => {
    // Buscamos el producto para conocer su categoría e ingredientes base.
    const producto = productos.find(p => p.id === linea.productoId);

    // Mapa de consumo de este producto (sin multiplicar por cantidad aún).
    const mapa = {};

    if (producto) {
      // Unidades base según el tipo de producto.
      if (producto.categoria === 'hotdog') {
        sumarConsumo(mapa, 'Pan', 1);
        sumarConsumo(mapa, 'Salchicha', 1);
      } else if (producto.categoria === 'hamburguesa') {
        sumarConsumo(mapa, 'Pan', 1);
        sumarConsumo(mapa, 'Carne', 0.15);
      }

      // Ingredientes extras que ya vienen en el producto.
      if (producto.categoria !== 'complemento') {
        (producto.ingredientes || []).forEach(nombre => {
          if (nombre === 'Tocino')   sumarConsumo(mapa, 'Tocino', 0.05);
          if (nombre === 'Queso')    sumarConsumo(mapa, 'Queso', 0.05);
          if (nombre === 'Lechuga')  sumarConsumo(mapa, 'Lechuga', 0.02);
          if (nombre === 'Jitomate') sumarConsumo(mapa, 'Jitomate', 0.05);
          if (nombre === 'Cebolla')  sumarConsumo(mapa, 'Cebolla', 0.05);
        });
      }
    }

    // Ingredientes agregados en la personalización.
    (linea.extras || []).forEach(extra => {
      if (extra === 'Tocino adicional')  sumarConsumo(mapa, 'Tocino', 0.05);
      if (extra === 'Queso extra')       sumarConsumo(mapa, 'Queso', 0.05);
      if (extra === 'Lechuga extra')     sumarConsumo(mapa, 'Lechuga', 0.02);
      if (extra === 'Jitomate extra')    sumarConsumo(mapa, 'Jitomate', 0.05);
      if (extra === 'Cebolla extra')     sumarConsumo(mapa, 'Cebolla', 0.05);
    });

    // Convierte el mapa en consumos multiplicados por la cantidad.
    Object.keys(mapa).forEach(nombre => {
      const ingrediente = ingredientes.find(ing => ing.nombre === nombre);
      consumos.push({
        nombre: nombre,
        cantidad: mapa[nombre] * linea.cantidad,
        unidad: ingrediente ? ingrediente.unidad : 'piezas'
      });
    });
  });

  // 2) Aplicar los descuentos al inventario y registrar salidas.
  consumos.forEach(consumo => {
    const ingrediente = ingredientes.find(ing => ing.nombre === consumo.nombre);
    if (ingrediente) {
      ingrediente.cantidad = Math.max(0, ingrediente.cantidad - consumo.cantidad);
      ingrediente.cantidad = Math.round(ingrediente.cantidad * 1000) / 1000;
    }

    movimientos.push({
      id: siguienteId(movimientos),
      fecha: formatoFechaLocal(new Date()),
      ingrediente: consumo.nombre,
      tipo: 'salida',
      cantidad: consumo.cantidad,
      unidad: consumo.unidad,
      motivo: 'Venta de pedido #' + pedido.id
    });
  });

  guardar(CLAVES.ingredientes, ingredientes);
  guardar(CLAVES.inventario, movimientos);
}

/* ---------------------------- Inicialización ----------------------------- */

document.addEventListener('DOMContentLoaded', renderizarResumen);