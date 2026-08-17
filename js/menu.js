/* =========================================================
   js/menu.js — App.Menu
   Ejercicio 2: responsabilidad única = manejar el estado del menú.
   Antes: `var menuData = {}` era global y cualquier script la podía
   pisar. Ahora vive encapsulada dentro del módulo (closure) y solo
   se lee/escribe mediante funciones.
   ========================================================= */
window.App = window.App || {};

App.Menu = (function () {
  "use strict";

  let cache = {}; // privado: no accesible desde fuera del módulo

  /**
   * Descarga el menú (App.Api) y lo guarda en caché interna.
   * @returns {Promise<Object>}
   */
  function load() {
    return App.Api.getMenu().then(function (menu) {
      cache = menu;
      return cache;
    });
  }

  function getAll() {
    return cache;
  }

  function getPrice(id) {
    return cache[id] ? cache[id].price : undefined;
  }

  function getName(id) {
    return cache[id] ? cache[id].name : undefined;
  }

  function isEmpty() {
    return Object.keys(cache).length === 0;
  }

  return {
    load: load,
    getAll: getAll,
    getPrice: getPrice,
    getName: getName,
    isEmpty: isEmpty,
  };
})();
