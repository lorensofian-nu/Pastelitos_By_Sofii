/* =========================================================
   js/api.js — App.Api
   Ejercicio 2: módulo con responsabilidad única (acceso a datos).
   Patrón IIFE en vez de módulos ES: al abrir el proyecto con
   doble clic (file://) los navegadores bloquean <script type="module">
   por CORS. El IIFE logra el mismo objetivo (nada de variables
   sueltas en el scope global) sin ese problema.
   Solo se crea UNA variable global: `App`.
   ========================================================= */
window.App = window.App || {};

App.Api = (function () {
  "use strict";

  const BASE_URL = "https://stock-flow-2e23e-default-rtdb.firebaseio.com/menu.json";

  /**
   * Obtiene el menú desde Firebase Realtime Database.
   * @returns {Promise<Object>} objeto { id: {name, price} }
   */
  function getMenu() {
    return fetch(BASE_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar el menú (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        return normalizeMenu(data);
      });
  }

  /**
   * Crea un producto nuevo en el menú.
   * NOTA DE SEGURIDAD (Ejercicio 3): esta escritura viaja sin
   * autenticación real hacia Firebase. En producción esto debe
   * protegerse con Firebase Auth + reglas de Realtime Database
   * (ver /firebase-rules-example.json). Aquí solo se exige haber
   * iniciado sesión en el cliente (App.Auth), lo cual es una
   * mejora didáctica, NO una medida de seguridad real.
   * @param {{name:string, price:number}} product
   */
  function createProduct(product) {
    return fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo crear el producto (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /**
   * Firebase RTDB puede devolver un arreglo o un objeto de objetos
   * según cómo se hayan guardado los datos. Esta función unifica
   * ambos casos en una sola forma: { id: {name, price} }
   */
  function normalizeMenu(data) {
    const menu = {};
    if (!data) return menu;

    if (Array.isArray(data)) {
      data.forEach(function (item, idx) {
        if (!item) return;
        const id = item.id !== undefined ? item.id : idx;
        menu[id] = toMenuEntry(item, id);
      });
    } else if (typeof data === "object") {
      Object.keys(data).forEach(function (key) {
        const item = data[key] || {};
        menu[key] = toMenuEntry(item, key);
      });
    }
    return menu;
  }

  function toMenuEntry(item, fallbackId) {
    return {
      name: item.name || ("Pastelito " + fallbackId),
      price: Number(item.price || item.precio || 0),
    };
  }

  return {
    getMenu: getMenu,
    createProduct: createProduct,
  };
})();
