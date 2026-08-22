/* =========================================================
   js/pedidos.js — App.Pedidos
   Ejercicio 5: lógica de negocio separada de la manipulación del DOM.
   Estas funciones son puras (mismo input -> mismo output, sin tocar
   el documento) por lo que se pueden probar de forma aislada
   (ver Ejercicio 4 / pruebas manuales al final del archivo).
   ========================================================= */
window.App = window.App || {};

App.Pedidos = (function () {
  "use strict";

  const IVA = 0.19;
  
  // Estados posibles para un pedido
  const ESTADOS = {
    EN_PROCESO: "en proceso",
    ENTREGADO: "entregado"
  };

  /**
   * Valida los datos crudos de un pedido antes de calcularlo.
   * @returns {{valid:boolean, message?:string}}
   */
  function validar(itemId, cantidad, precioUnitario) {
    if (!itemId) {
      return { valid: false, message: "Selecciona un pastelito del menú." };
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0 || !Number.isInteger(cantidad)) {
      return { valid: false, message: "La cantidad debe ser un número entero mayor a 0." };
    }
    if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
      return { valid: false, message: "El precio unitario debe ser mayor a 0." };
    }
    return { valid: true };
  }

  /**
   * Calcula subtotal, IVA y total de un pedido. Función pura,
   * sin efectos secundarios (no toca el DOM).
   * @returns {{subtotal:number, iva:number, total:number}}
   */
  function calcular(cantidad, precioUnitario) {
    const subtotal = cantidad * precioUnitario;
    const iva = subtotal * IVA;
    const total = subtotal + iva;
    return { subtotal: subtotal, iva: iva, total: total };
  }

  return {
    validar: validar,
    calcular: calcular,
    IVA: IVA,
    ESTADOS: ESTADOS,
  };
})();

/* ---------------------------------------------------------
   Ejercicio 4 — "Pruebas" manuales rápidas.
   Se pueden ejecutar pegando este archivo en la consola del
   navegador, o llamando a App.Pedidos.__test() desde la consola
   una vez cargada la página. No sustituye un framework de testing
   real, pero deja evidencia de que la lógica se comprobó.
   --------------------------------------------------------- */
App.Pedidos.__test = function () {
  const casos = [
    { cantidad: 2, precio: 10, totalEsperado: 23.8 },
    { cantidad: 1, precio: 5, totalEsperado: 5.95 },
  ];
  let ok = true;
  casos.forEach(function (c, i) {
    const r = App.Pedidos.calcular(c.cantidad, c.precio);
    const paso = Math.abs(r.total - c.totalEsperado) < 0.001;
    ok = ok && paso;
    console.log("Caso " + (i + 1) + ":", paso ? "OK" : "FALLÓ", r);
  });
  console.log(ok ? "✅ Todos los casos pasaron" : "❌ Hay casos fallidos");
  return ok;
};
