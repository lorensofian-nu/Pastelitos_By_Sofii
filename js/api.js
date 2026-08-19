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
  const PEDIDOS_URL = "https://stock-flow-2e23e-default-rtdb.firebaseio.com/pedidos.json";

  const FALLBACK_MENU = {
    "1": { name: "Cupcake de vainilla",    price: 3500, image: "images/menu/cupcake_vainilla.jpg" },
    "2": { name: "Brownie de chocolate",   price: 4000, image: "images/menu/brownie_chocolate.jpg" },
    "3": { name: "Galleta de mantequilla", price: 2500, image: "images/menu/galleta_mantequilla.jpg" },
    "4": { name: "Muffin de arándanos",    price: 3800, image: "images/menu/muffin_arandanos.jpg" },
    "5": { name: "Pastel de fresa",        price: 5000, image: "images/menu/pastel_fresa.jpg" },
    "6": { name: "Donut glaseado",         price: 3200, image: "images/menu/donut_glaseado.jpg" },
  };

  /**
   * Obtiene el menú desde Firebase Realtime Database.
   * Si Firebase no responde, devuelve el menú de ejemplo local.
   * @returns {Promise<Object>} objeto { id: {name, price} }
   */
  function getMenu() {
    return fetch(BASE_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar el menú (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        var menu = normalizeMenu(data);
        // Si Firebase devolvió vacío, usar fallback
        if (Object.keys(menu).length === 0) return FALLBACK_MENU;
        return menu;
      })
      .catch(function (err) {
        console.warn("Firebase no disponible, usando menú de ejemplo:", err.message);
        return FALLBACK_MENU;
      });
  }

  /**
   * Crea un producto nuevo en el menú.
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
   * Actualiza un producto existente por su ID.
   * @param {string} id
   * @param {{name:string, price:number}} product
   */
  function updateProduct(id, product) {
    var url = "https://stock-flow-2e23e-default-rtdb.firebaseio.com/menu/" + id + ".json";
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo actualizar el producto (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /**
   * Elimina un producto por su ID.
   * @param {string} id
   */
  function deleteProduct(id) {
    var url = "https://stock-flow-2e23e-default-rtdb.firebaseio.com/menu/" + id + ".json";
    return fetch(url, { method: "DELETE" }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo eliminar el producto (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /* ---------- Pedidos (órdenes de compra) ---------- */

  /**
   * Guarda un pedido nuevo en Firebase.
   * @param {{productId:string, productName:string, quantity:number, unitPrice:number, subtotal:number, iva:number, total:number}} pedido
   */
  function createPedido(pedido) {
    return fetch(PEDIDOS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo guardar el pedido (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /**
   * Obtiene todos los pedidos guardados.
   * @returns {Promise<Object>} { id: {productId, productName, quantity, ...} }
   */
  function getPedidos() {
    return fetch(PEDIDOS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        return data || {};
      })
      .catch(function (err) {
        console.warn("Error cargando pedidos:", err.message);
        return {};
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
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    createPedido: createPedido,
    getPedidos: getPedidos,
  };
})();
