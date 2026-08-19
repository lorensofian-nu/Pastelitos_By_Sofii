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

  // Toggle campos de domicilio según tipo de entrega
  var radiosEntrega = document.querySelectorAll('input[name="entrega"]');
  radiosEntrega.forEach(function (radio) {
    radio.addEventListener("change", toggleDomicilioFields);
  });
});

function toggleDomicilioFields() {
  var esDomicilio = document.querySelector('input[name="entrega"]:checked').value === "domicilio";
  var container = document.getElementById("domicilioFields");
  if (esDomicilio) {
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
  }
}

function getTipoEntrega() {
  return document.querySelector('input[name="entrega"]:checked').value;
}

function getDatosEntrega() {
  var tipo = getTipoEntrega();
  if (tipo === "tienda") {
    return { tipo: "tienda" };
  }
  return {
    tipo: "domicilio",
    direccion: document.getElementById("dirDireccion").value.trim(),
    barrio: document.getElementById("dirBarrio").value.trim(),
    telefono: document.getElementById("dirTelefono").value.trim(),
    referencia: document.getElementById("dirReferencia").value.trim(),
  };
}

function validarDireccion() {
  var tipo = getTipoEntrega();
  if (tipo === "tienda") return true;

  var dir = document.getElementById("dirDireccion").value.trim();
  var barrio = document.getElementById("dirBarrio").value.trim();
  var tel = document.getElementById("dirTelefono").value.trim();

  if (!dir || !barrio || !tel) {
    return false;
  }
  return true;
}

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

  // Validar dirección si es domicilio
  if (getTipoEntrega() === "domicilio" && !validarDireccion()) {
    resultadoDiv.innerHTML = '<div class="msg msg-error">Para domicilio completa: dirección, barrio y teléfono.</div>';
    document.getElementById("btnConfirmar").classList.add("hidden");
    ultimoCalculo = null;
    return;
  }

  var calculo = App.Pedidos.calcular(cantidad, precioUnitario);

  // Guardar datos para posible confirmación
  ultimoCalculo = calculo;
  ultimoItemId = itemId;
  ultimoItemNombre = itemNombre;

  var tipoEntrega = getTipoEntrega();
  var textoEntrega = tipoEntrega === "tienda" ? "Recoger en tienda" : "Domicilio";

  resultadoDiv.innerHTML =
    '<div class="order-summary">' +
    '<div class="line"><span>Pastelito</span><span>' + itemNombre + " &times;" + cantidad + "</span></div>" +
    '<div class="line"><span>Entrega</span><span>' + textoEntrega + "</span></div>" +
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
    entrega: getDatosEntrega(),
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
  // Reset entrega a tienda
  document.querySelector('input[name="entrega"][value="tienda"]').checked = true;
  toggleDomicilioFields();
  document.getElementById("dirDireccion").value = "";
  document.getElementById("dirBarrio").value = "";
  document.getElementById("dirTelefono").value = "";
  document.getElementById("dirReferencia").value = "";
}
