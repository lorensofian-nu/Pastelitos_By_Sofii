/* =========================================================
   js/pages/pedido-page.js
   Ejercicio 2 y 5: reemplaza a la función monolítica tomarTodo()
   del legacy. Aquí solo se hace manipulación del DOM; el cálculo
   y la validación viven en App.Pedidos (lógica de negocio pura).
   Nombres de variables descriptivos en vez de a/b/p.
   ========================================================= */
window.addEventListener("DOMContentLoaded", function () {
  App.Nav.init("pedido");
  cargarSelectDeMenu();

  document.getElementById("itemSelect").addEventListener("change", autocompletarPrecio);
  document.getElementById("btnProcesar").addEventListener("click", procesarPedido);
});

function cargarSelectDeMenu() {
  const select = document.getElementById("itemSelect");
  select.innerHTML = '<option value="">--Cargando menú--</option>';

  App.Menu.load()
    .then(function (menu) {
      select.innerHTML = '<option value="">--Selecciona un pastelito--</option>';
      Object.keys(menu).forEach(function (id) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.text = menu[id].name + " ($" + menu[id].price.toFixed(2) + ")";
        select.appendChild(opt);
      });
    })
    .catch(function () {
      select.innerHTML = '<option value="">--Error cargando menú--</option>';
    });
}

function autocompletarPrecio() {
  const itemId = document.getElementById("itemSelect").value;
  const precio = App.Menu.getPrice(itemId);
  if (precio !== undefined) {
    document.getElementById("precioUnitario").value = precio;
  }
}

function procesarPedido() {
  const itemId = document.getElementById("itemSelect").value;
  const itemNombre = App.Menu.getName(itemId) || "";
  const cantidad = Number(document.getElementById("cantidad").value);
  const precioUnitario = Number(document.getElementById("precioUnitario").value);

  const resultadoDiv = document.getElementById("resultado");
  const validacion = App.Pedidos.validar(itemId, cantidad, precioUnitario);

  if (!validacion.valid) {
    resultadoDiv.innerHTML = '<div class="msg msg-error">' + validacion.message + "</div>";
    return;
  }

  const calculo = App.Pedidos.calcular(cantidad, precioUnitario);

  resultadoDiv.innerHTML =
    '<div class="order-summary">' +
    '<div class="line"><span>Pastelito</span><span>' + itemNombre + " ×" + cantidad + "</span></div>" +
    '<div class="line"><span>Subtotal</span><span>$' + calculo.subtotal.toFixed(2) + "</span></div>" +
    '<div class="line"><span>IVA (19%)</span><span>$' + calculo.iva.toFixed(2) + "</span></div>" +
    '<div class="line total"><span>Total</span><span>$' + calculo.total.toFixed(2) + "</span></div>" +
    "</div>";

  limpiarFormulario();
}

function limpiarFormulario() {
  document.getElementById("itemSelect").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("precioUnitario").value = "";
}
