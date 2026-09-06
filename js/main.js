/* ==========================================================================
   js/main.js  —  Utilidades comunes de toda la aplicación.

   Aquí viven las funciones y configuraciones compartidas:
   - Atajos para seleccionar elementos.
   - Formato de precios y fechas.
   - Mensajes de confirmación (toast).
   - Contador de artículos en el carrito (se muestra en la barra de navegación).
   - Validaciones de formularios.
   ========================================================================== */

'use strict';

/* --------------------------- Atajos DOM -------------------------------- */

// Ejemplo: const boton = $('#btn-aceptar');
function $(selector) {
  return document.querySelector(selector);
}

// Ejemplo: const botones = $$('.btn-danger');
function $$(selector) {
  return document.querySelectorAll(selector);
}

/* --------------------------- Formato ----------------------------------- */

// Convierte un número a moneda mexicana: 3250 -> "$3,250"
function formatearPrecio(cantidad) {
  return '$' + Number(cantidad).toLocaleString('es-MX');
}

// Convierte "AAAA-MM-DD HH:MM" a "DD/MM/AAAA" (solo la parte de la fecha).
function formatearFecha(fechaTexto) {
  const partes = (fechaTexto || '').split(' ')[0].split('-');
  if (partes.length !== 3) return fechaTexto || '';
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// Convierte "AAAA-MM-DD HH:MM" a "DD/MM/AAAA 13:15".
function formatearFechaHora(fechaTexto) {
  const dia = formatearFecha(fechaTexto);
  const hora = (fechaTexto || '').split(' ')[1];
  return hora ? dia + ' ' + hora : dia;
}

// Valida un teléfono: solo números, espacios, +, () y - con 10 a 15 dígitos.
function telefonoValido(telefono) {
  const digitos = telefono.replace(/\D/g, '');
  return digitos.length >= 10 && digitos.length <= 15;
}

/* --------------------------- Mensajes toast ----------------------------- */

// Muestra un mensaje flotante en la parte inferior de la página.
// tipos: 'exito' (verde), 'error' (rojo), 'info' (azul).
function mostrarToast(mensaje, tipo) {
  let clase = 'toast-info';
  if (tipo === 'exito') clase = 'toast-exito';
  if (tipo === 'error') clase = 'toast-error';

  const aviso = document.createElement('div');
  aviso.className = 'toast ' + clase;
  aviso.textContent = mensaje;
  document.body.appendChild(aviso);

  // El aviso desaparece solo después de 3 segundos.
  setTimeout(() => {
    aviso.classList.add('toast-salida');
    setTimeout(() => aviso.remove(), 400);
  }, 3000);
}

/* ----------------------- Carrito (contador) ----------------------------- */

// Suma la cantidad de artículos guardados en el carrito.
function totalArticulosCarrito() {
  const carrito = leer(CLAVES.carrito, []);
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

// Actualiza el número rojo que aparece junto al icono del carrito en la
// barra de navegación. Se llama en cada página al cargar.
function actualizarContadorCarrito() {
  const total = totalArticulosCarrito();
  $$('.contador-carrito').forEach(contador => {
    contador.textContent = total;
    // Oculta el contador si el carrito está vacío.
    contador.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ------------------------- Menú de navegación --------------------------- */

// Activa/desactiva el menú hamburguesa en pantallas pequeñas.
function alternarMenuMovil() {
  const navegacion = $('#menu-navegacion');
  if (navegacion) navegacion.classList.toggle('mostrar');
}

// Cierra el menú móvil al hacer clic en cualquier enlace.
function cerrarMenuMovil() {
  const navegacion = $('#menu-navegacion');
  if (navegacion) navegacion.classList.remove('mostrar');
}

/* ------------------------ Validaciones generales ------------------------ */

// Devuelve true si todos los campos de un formulario están llenos.
function formCompleto(formulario) {
  for (const campo of formulario.querySelectorAll('input, textarea, select')) {
    if (campo.hasAttribute('required') && !campo.value.trim()) {
      return false;
    }
  }
  return true;
}

// Mezcla dos objetos: devuelve un objeto nuevo con las propiedades de ambos.
function objetoUnido(base, extra) {
  return Object.assign({}, base, extra);
}

// Se ejecuta al cargar cada página.
document.addEventListener('DOMContentLoaded', () => {
  iniciarDatos();            // Asegura que existan los datos demo.
  actualizarContadorCarrito(); // Muestra el número de artículos en el carrito.
});