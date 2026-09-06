/* ==========================================================================
   js/login.js  —  Inicio de sesión del administrador (simulado).

   IMPORTANTE:
   El acceso se valida contra los usuarios guardados en localStorage.
   Esto SOLO es una demostración. No se debe usar como sistema de seguridad
   real; una aplicación real usaría un servidor con autenticación segura.
   ========================================================================== */

'use strict';

/* ------------------------- Validación del acceso ------------------------- */

// Se ejecuta al enviar el formulario de login.
function iniciarSesion(evento) {
  evento.preventDefault();

  const usuario = $('#campo-usuario').value.trim();
  const contrasena = $('#campo-contrasena').value;
  const mensajeError = $('#mensaje-error');

  // Campos vacíos.
  if (!usuario || !contrasena) {
    mensajeError.textContent = 'Completa todos los campos.';
    return false;
  }

  // Busca el usuario en la lista guardada.
  const usuarios = leer(CLAVES.usuarios, USUARIOS_DEFAULT);
  const encontrado = usuarios.find(u =>
    u.usuario === usuario && u.contrasena === contrasena);

  if (!encontrado) {
    mensajeError.textContent = 'Usuario o contraseña incorrectos.';
    return false;
  }

  // Guarda la sesión activa y redirige al panel administrativo.
  guardar(CLAVES.sesion, true);
  mostrarToast('Bienvenido, ' + usuario + '.', 'exito');
  window.location.href = 'admin.html';
  return false;
}

// Si ya hay una sesión activa, el login no es necesario.
document.addEventListener('DOMContentLoaded', () => {
  const haySesion = leer(CLAVES.sesion, false);
  if (haySesion) window.location.href = 'admin.html';
});