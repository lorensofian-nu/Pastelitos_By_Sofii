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

  const BASE_URL = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/menu.json";
  const PEDIDOS_URL = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/pedidos.json";

  const FALLBACK_MENU = {
    "1": { name: "Cupcake de vainilla",    price: 3500, image: "images/menu/cupcake_vainilla.jpg" },
    "2": { name: "Brownie de chocolate",   price: 4000, image: "images/menu/brownie_chocolate.jpg" },
    "3": { name: "Galleta de mantequilla", price: 2500, image: "images/menu/galleta_mantequilla.jpg" },
    "4": { name: "Muffin de arándanos",    price: 3800, image: "images/menu/muffin_arandanos.jpg" },
    "5": { name: "Pastel de fresa",        price: 5000, image: "images/menu/pastel_fresa.jpg" },
    "6": { name: "Donut glaseado",         price: 3200, image: "images/menu/donut_glaseado.jpg" },
    "7": { name: "Cheesecake de frutos rojos", price: 6500, image: "images/menu/cheesecake_frutos_rojos.jpg" },
    "8": { name: "Tiramisú clásico",        price: 7200, image: "images/menu/tiramisu.jpg" },
    "9": { name: "Flan de caramelo",        price: 4500, image: "images/menu/flan_caramelo.jpg" },
    "10": { name: "Panna cotta de vainilla", price: 5800, image: "images/menu/panna_cotta.jpg" },
    "11": { name: "Tarta de limón merengada", price: 5500, image: "images/menu/tarta_limon.jpg" },
    "12": { name: "Croissant clásico",       price: 3800, image: "images/menu/croissant.jpg" },
    "13": { name: "Concha de azúcar",        price: 2800, image: "images/menu/concha_azucar.jpg" },
    "14": { name: "Pan de muerto",           price: 4200, image: "images/menu/pan_muerto.jpg" },
    "15": { name: "Orejas (hojaldre)",       price: 3500, image: "images/menu/orejas_hojaldre.jpg" },
    "16": { name: "Empanada de piña",        price: 3200, image: "images/menu/empanada_pina.jpg" },
    "17": { name: "Pastel de chocolate negro", price: 6800, image: "images/menu/pastel_chocolate_negro.jpg" },
    "18": { name: "Pastel de zanahoria",     price: 6200, image: "images/menu/pastel_zanahoria.jpg" },
    "19": { name: "Pastel de red velvet",     price: 7500, image: "images/menu/pastel_red_velvet.jpg" },
    "20": { name: "Tres leches",             price: 5800, image: "images/menu/tres_leches.jpg" },
    "21": { name: "Galleta de avena y pasas", price: 2200, image: "images/menu/galleta_avena.jpg" },
    "22": { name: "Alfajor de maicena",      price: 2500, image: "images/menu/alfajor_maicena.jpg" },
    "23": { name: "Churros con chocolate",   price: 4000, image: "images/menu/churros_chocolate.jpg" },
    "24": { name: "Palmeritas de hojaldre",  price: 2800, image: "images/menu/palmeritas.jpg" },
    "25": { name: "Chocolate caliente",      price: 3500, image: "images/menu/chocolate_caliente.jpg" },
    "26": { name: "Café con leche",          price: 2500, image: "images/menu/cafe_con_leche.jpg" },
    "27": { name: "Té de manzanilla",         price: 2000, image: "images/menu/te_manzanilla.jpg" }
  };

  // Datos de ejemplo para pedidos (fallback si Firebase no responde)
  const FALLBACK_PEDIDOS = {
    "-P-1": {
      productId: "1", productName: "Cupcake de vainilla", quantity: 3, unitPrice: 3500,
      subtotal: 10500, iva: 1995, total: 12495,
      entrega: { tipo: "tienda" },
      estado: "entregado",
      date: "2026-08-18T10:00:00.000Z"
    },
    "-P-2": {
      productId: "2", productName: "Brownie de chocolate", quantity: 2, unitPrice: 4000,
      subtotal: 8000, iva: 1520, total: 9520,
      entrega: { tipo: "domicilio", direccion: "Calle 10 #5-20", barrio: "Centro", telefono: "3001234567", referencia: "Casa blanca" },
      estado: "en proceso",
      date: "2026-08-17T14:30:00.000Z"
    },
    "-P-3": {
      productId: "5", productName: "Pastel de fresa", quantity: 1, unitPrice: 5000,
      subtotal: 5000, iva: 950, total: 5950,
      entrega: { tipo: "tienda" },
      estado: "entregado",
      date: "2026-08-16T11:15:00.000Z"
    },
    "-P-4": {
      productId: "7", productName: "Cheesecake de frutos rojos", quantity: 1, unitPrice: 6500,
      subtotal: 6500, iva: 1235, total: 7735,
      entrega: { tipo: "domicilio", direccion: "Avenida Principal", barrio: "Norte", telefono: "3009876543" },
      estado: "en proceso",
      date: "2026-08-15T09:45:00.000Z"
    },
    "-P-5": {
      productId: "12", productName: "Croissant clásico", quantity: 4, unitPrice: 3800,
      subtotal: 15200, iva: 2888, total: 18088,
      entrega: { tipo: "tienda" },
      estado: "entregado",
      date: "2026-08-14T16:20:00.000Z"
    }
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
    var url = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/menu/" + id + ".json";
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
    var url = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/menu/" + id + ".json";
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
   * Actualiza un pedido existente por su ID.
   * @param {string} id
   * @param {{estado?:string, productId?:string, productName?:string, quantity?:number, unitPrice?:number, subtotal?:number, iva?:number, total?:number}} pedido
   */
  function updatePedido(id, pedido) {
    var url = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/pedidos/" + id + ".json";
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo actualizar el pedido (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /**
   * Actualiza parcialmente un pedido (PATCH) por su ID.
   * @param {string} id
   * @param {{estado?:string}} pedido
   */
  function patchPedido(id, pedido) {
    var url = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/pedidos/" + id + ".json";
    return fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    }).then(function (res) {
      if (!res.ok) throw new Error("No se pudo actualizar el pedido (HTTP " + res.status + ")");
      return res.json();
    });
  }

  /**
   * Obtiene todos los pedidos guardados.
   * Si Firebase no responde, devuelve los pedidos de ejemplo local.
   * @returns {Promise<Object>} { id: {productId, productName, quantity, ...} }
   */
  function getPedidos() {
    return fetch(PEDIDOS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudieron cargar los pedidos (HTTP " + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        // Si Firebase devolvió vacío o null, usar fallback
        if (!data || Object.keys(data).length === 0) return FALLBACK_PEDIDOS;
        return data;
      })
      .catch(function (err) {
        console.warn("Firebase no disponible, usando pedidos de ejemplo:", err.message);
        return FALLBACK_PEDIDOS;
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
    updatePedido: updatePedido,
    patchPedido: patchPedido,
    getPedidos: getPedidos,
  };
})();