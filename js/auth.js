/* =========================================================
   js/auth.js — App.Auth
   Ejercicio 3: autenticación y seguridad.

   Qué se mejoró respecto al legacy:
   - Las credenciales ya no viven sueltas como variables globales
     (var ADMIN_USER, var ADMIN_PASS) sino encapsuladas en este módulo.
   - El estado de sesión (isLogged) ya no es una variable global de
     `window`; se guarda en sessionStorage bajo una sola clave y se
     expone solo mediante App.Auth.isLoggedIn().
   - Toda la app consulta el estado a través de funciones (login,
     logout, isLoggedIn) en vez de leer/escribir una bandera global.

   Qué SIGUE sin ser seguro (y por qué):
   - Cualquier persona puede abrir las herramientas de desarrollador
     y leer este archivo, así que ninguna validación en el cliente
     es una barrera real. Esto es inherente a la arquitectura MPA
     estática (sin backend) del taller.
   - La solución correcta en un proyecto real es:
       1) Reemplazar este login por Firebase Authentication
          (firebase.auth().signInWithEmailAndPassword(...)).
       2) Restringir la escritura en Realtime Database con reglas
          de seguridad server-side (ver /firebase-rules-example.json),
          que son las que de verdad impiden escrituras no autorizadas.
   - Dejamos el login "falso" solo con fines didácticos, para que el
     formulario siga siendo funcional sin depender de credenciales
     de un proyecto Firebase real que no tenemos configurado.
   ========================================================= */
window.App = window.App || {};

App.Auth = (function () {
  "use strict";

  // TODO(Ejercicio 3 - siguiente paso real): sustituir este bloque
  // por Firebase Authentication. Ejemplo (requiere firebase-app y
  // firebase-auth SDK + config del proyecto):
  //
  //   firebase.auth().signInWithEmailAndPassword(email, password)
  //     .then(userCredential => { ... })
  //     .catch(error => { ... });
  //
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin";
  const SESSION_KEY = "pastelitos_session";

  function login(user, pass) {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: user }));
      return { ok: true };
    }
    return { ok: false, message: "Usuario o contraseña incorrectos" };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  }

  function currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw).user : null;
  }

  /**
   * Protege una página: si no hay sesión, redirige a login.html.
   * Se llama al inicio de admin.html.
   */
  function requireLogin(redirectTo) {
    if (!isLoggedIn()) {
      window.location.href = redirectTo || "login.html";
    }
  }

  return {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    requireLogin: requireLogin,
  };
})();
