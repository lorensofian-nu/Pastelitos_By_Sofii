/* =========================================================
   js/pages/pedido-page.js — Tomar pedido (sin login)
   El usuario puede calcular y confirmar un pedido sin iniciar
   sesión. El pedido se guarda en Firebase para que el admin
   pueda verlo en el dashboard.
   ========================================================= */
window.addEventListener("DOMContentLoaded", function () {
  App.Nav.init("pedido");
  cargarSelectDeMenu();

  document.getElementById("itemSelect").addEventListener("change", autocompletarPrecio);
  document.getElementById("btnProcesar").addEventListener("click", procesarPedido);
  document.getElementById("btnConfirmar").addEventListener("click", confirmarPedido);
});

var ultimoCalculo = null;
var ultimoItemId = null;
var ultimoItemNombre = "";

function cargarSelectDeMenu() {
  var select = document.getElementById("itemSelect");
  select.innerHTML = '<option value="">--Cargando menú--</option>';

  App.Menu.load()
    .then(function (menu) {
      select.innerHTML = '<option value="">--Selecciona un pastelito--</option>';
      Object.keys(menu).forEach(function (id) {
        var opt = document.createElement("option");
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
  var itemId = document.getElementById("itemSelect").value;
  var precio = App.Menu.getPrice(itemId);
  if (precio !== undefined) {
    document.getElementById("precioUnitario").value = precio;
  }
  // Reset estado al cambiar de producto
  document.getElementById("btnConfirmar").classList.add("hidden");
  document.getElementById("resultado").innerHTML = "";
  ultimoCalculo = null;
}

function procesarPedido() {
  var itemId = document.getElementById("itemSelect").value;
  var itemNombre = App.Menu.getName(itemId) || "";
  var cantidad = Number(document.getElementById("cantidad").value);
  var precioUnitario = Number(document.getElementById("precioUnitario").value);

  var resultadoDiv = document.getElementById("resultado");
  var validacion = App.Pedidos.validar(itemId, cantidad, precioUnitario);

  if (!validacion.valid) {
    resultadoDiv.innerHTML = '<div class="msg msg-error">' + validacion.message + "</div>";
    document.getElementById("btnConfirmar").classList.add("hidden");
    ultimoCalculo = null;
    return;
  }

  var calculo = App.Pedidos.calcular(cantidad, precioUnitario);

  // Guardar datos para posible confirmación
  ultimoCalculo = calculo;
  ultimoItemId = itemId;
  ultimoItemNombre = itemNombre;

  resultadoDiv.innerHTML =
    '<div class="order-summary">' +
    '<div class="line"><span>Pastelito</span><span>' + itemNombre + " &times;" + cantidad + "</span></div>" +
    '<div class="line"><span>Subtotal</span><span>$' + calculo.subtotal.toFixed(2) + "</span></div>" +
    '<div class="line"><span>IVA (19%)</span><span>$' + calculo.iva.toFixed(2) + "</span></div>" +
    '<div class="line total"><span>Total</span><span>$' + calculo.total.toFixed(2) + "</span></div>" +
    "</div>";

  // Mostrar botón de confirmar
  document.getElementById("btnConfirmar").classList.remove("hidden");
}

function confirmarPedido() {
  if (!ultimoCalculo) return;

  var btnConfirmar = document.getElementById("btnConfirmar");
  var btnProcesar = document.getElementById("btnProcesar");
  var resultadoDiv = document.getElementById("resultado");

  btnConfirmar.disabled = true;
  btnProcesar.disabled = true;
  resultadoDiv.innerHTML += '<div class="msg msg-info">Guardando pedido…</div>';

  var pedido = {
    productId: ultimoItemId,
    productName: ultimoItemNombre,
    quantity: Number(document.getElementById("cantidad").value),
    unitPrice: Number(document.getElementById("precioUnitario").value),
    subtotal: ultimoCalculo.subtotal,
    iva: ultimoCalculo.iva,
    total: ultimoCalculo.total,
    date: new Date().toISOString(),
  };

  App.Api.createPedido(pedido)
    .then(function () {
      resultadoDiv.innerHTML =
        '<div class="msg msg-success">Pedido guardado exitosamente. ¡Gracias!</div>';
      limpiarFormulario();
      document.getElementById("btnConfirmar").classList.add("hidden");
    })
    .catch(function (err) {
      console.error(err);
      resultadoDiv.innerHTML =
        '<div class="msg msg-error">No se pudo guardar el pedido. Intenta de nuevo.</div>';
    })
    .finally(function () {
      btnConfirmar.disabled = false;
      btnProcesar.disabled = false;
      ultimoCalculo = null;
    });
}

function limpiarFormulario() {
  document.getElementById("itemSelect").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("precioUnitario").value = "";
}
