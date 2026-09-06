/* ==========================================================================
   js/productos.js  —  Catálogo del menú y personalización.

   Tareas:
   1. Leer los productos guardados en localStorage.
   2. Generar las tarjetas de cada categoría (hot dogs, hamburguesas, complementos).
   3. Abrir la ventana modal para personalizar un hot dog o hamburguesa
      (agregar tocino, ingredientes extra y cantidad).
   4. Calcular el total automáticamente y agregar al carrito.
   ========================================================================== */

'use strict';

/* ----------------------- Estado de la personalización -------------------- */

// Producto que se está personalizando actualmente.
let productoActual = null;

// Cantidad elegida en la ventana modal.
let cantidadModal = 1;

/* ------------------------- Renderizado del menú -------------------------- */

// Categorías que se muestran, en orden.
const CATEGORIAS = [
  { clave: 'hotdog',       titulo: 'HOT DOGS' },
  { clave: 'hamburguesa',  titulo: 'HAMBURGUESAS' },
  { clave: 'complemento',  titulo: 'COMPLEMENTOS' }
];

// Dibuja todas las categorías dentro de <div id="contenedor-menu">.
function renderizarMenu() {
  const contenedor = $('#contenedor-menu');
  if (!contenedor) return;

  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);

  let htmlTotal = '';
  CATEGORIAS.forEach(categoria => {
    const lista = productos.filter(producto =>
      producto.categoria === categoria.clave && producto.disponible !== false);

    if (lista.length === 0) return;

    htmlTotal += '<h2 class="categoria-titulo">' + categoria.titulo + '</h2>';
    htmlTotal += '<div class="grid-productos">';
    lista.forEach(producto => {
      htmlTotal += tarjetaProducto(producto);
    });
    htmlTotal += '</div>';
  });

  contenedor.innerHTML = htmlTotal;
}

// Crea el HTML de una tarjeta de producto.
function tarjetaProducto(producto) {
  const ingredientesHtml = (producto.ingredientes || [])
    .map(nombre => '<span>' + nombre + '</span>')
    .join('');

  // Los complementos se agregan directo; los hot dogs y hamburguesas abren
  // la ventana de personalización.
  const puedePersonalizar = producto.categoria !== 'complemento';
  const accion = puedePersonalizar
    ? 'onclick="abrirPersonalizacion(' + producto.id + ')"'
    : 'onclick="agregarDirecto(' + producto.id + ')"';

  const boton = producto.disponible === false
    ? '<span class="btn btn-secundario" style="cursor:not-allowed;">NO DISPONIBLE</span>'
    : '<button class="btn btn-primario btn-agregar" ' + accion + '>AGREGAR AL CARRITO</button>';

  const clasePrecio = producto.disponible === false ? 'producto-precio agotado' : 'producto-precio';

  return (
    '<article class="producto">' +
    '  <img class="producto-imagen" src="' + producto.img + '" alt="' + producto.nombre + '">' +
    '  <div class="producto-cuerpo">' +
    '    <h3 class="producto-nombre">' + producto.nombre + '</h3>' +
    '    <p class="producto-descripcion">' + producto.descripcion + '</p>' +
    '    <div class="producto-ingredientes">' + ingredientesHtml + '</div>' +
    '    <div class="producto-pie">' +
    '      <span class="' + clasePrecio + '">' + formatearPrecio(producto.precio) + '</span>' +
             boton +
    '    </div>' +
    '  </div>' +
    '</article>'
  );
}

/* ------------------------- Personalización ------------------------------- */

// Abre la ventana modal para personalizar un producto.
function abrirPersonalizacion(idProducto) {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const producto = productos.find(p => p.id === idProducto);
  if (!producto || producto.disponible === false) return;

  // Restablece la selección.
  productoActual = producto;
  cantidadModal = 1;

  // Datos básicos del producto.
  $('#modal-imagen').src = producto.img;
  $('#modal-nombre').textContent = producto.nombre;
  $('#modal-descripcion').textContent = producto.descripcion;
  $('#modal-precio').textContent = formatearPrecio(producto.precio);
  $('#modal-cantidad').textContent = '1';

  // Quita la selección de tocino (por defecto "No").
  const radioNo = document.querySelector('input[name="tocino"][value="no"]');
  if (radioNo) radioNo.checked = true;

  // Genera las casillas de ingredientes adicionales.
  // Nota: "Tocino adicional" se controla con la pregunta ¿Quieres tocino?,
  // por eso se omite de la lista de casillas.
  const listaExtras = $('#modal-extras');
  listaExtras.innerHTML = '';
  EXTRAS_PERSONALIZACION.forEach(extra => {
    if (extra.id === 'tocino') return;

    const etiqueta = document.createElement('label');
    etiqueta.innerHTML =
      '<span class="extra-nombre">' +
      '  <input type="checkbox" value="' + extra.id + '" onchange="actualizarTotalModal()"> ' +
        extra.nombre +
      '</span>' +
      '<span class="extra-precio">+' + formatearPrecio(extra.precio) + '</span>';
    listaExtras.appendChild(etiqueta);
  });

  // Muestra la ventana y actualiza el total.
  const modal = $('#modal-personalizar');
  modal.hidden = false;
  modal.style.display = 'flex';
  actualizarTotalModal();
}

// Cierra la ventana modal de personalización.
function cerrarModal() {
  const modal = $('#modal-personalizar');
  modal.hidden = true;
  modal.style.display = 'none';
}

// Cambia la cantidad del modal (+1 o -1, mínimo 1).
function cambiarCantidadModal(delta) {
  cantidadModal = Math.max(1, cantidadModal + delta);
  $('#modal-cantidad').textContent = cantidadModal;
  actualizarTotalModal();
}

// Arma la lista de extras seleccionados con su precio.
function extrasSeleccionados() {
  const extras = [];

  // Pregunta ¿Quieres tocino? (sí agrega tocino con costo extra).
  const tocino = document.querySelector('input[name="tocino"]:checked');
  if (tocino && tocino.value === 'si') {
    extras.push({ nombre: 'Tocino adicional', precio: 10 });
  }

  // Casillas de ingredientes extra marcadas.
  $$('#modal-extras input[type="checkbox"]:checked').forEach(casilla => {
    const extra = EXTRAS_PERSONALIZACION.find(e => e.id === casilla.value);
    if (extra) extras.push({ nombre: extra.nombre, precio: extra.precio });
  });

  return extras;
}

// Calcula y muestra el total (base + extras + cantidad).
function actualizarTotalModal() {
  if (!productoActual) return;

  const precioBase = productoActual.precio;
  const precioExtras = extrasSeleccionados().reduce((total, extra) => total + extra.precio, 0);
  const total = (precioBase + precioExtras) * cantidadModal;
  $('#modal-total').textContent = formatearPrecio(total);
}

// Agrega al carrito el producto personalizado actual.
function agregarPersonalizado() {
  if (!productoActual) return;

  const extras = extrasSeleccionados();
  agregarAlCarrito(productoActual, extras, cantidadModal);
  mostrarToast('Producto agregado al carrito.', 'exito');
  cerrarModal();
}

// Agrega directamente un producto sin personalización (complementos).
function agregarDirecto(idProducto) {
  const productos = leer(CLAVES.productos, PRODUCTOS_DEFAULT);
  const producto = productos.find(p => p.id === idProducto);
  if (!producto) return;

  agregarAlCarrito(producto, [], 1);
  mostrarToast(producto.nombre + ' agregado al carrito.', 'exito');
}

/* ---------------------------- Inicialización ----------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  renderizarMenu();
});