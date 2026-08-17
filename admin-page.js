/* js/pages/admin-page.js */
window.addEventListener("DOMContentLoaded", function () {
  // Ejercicio 3: la vista se protege comprobando la sesión ANTES
  // de mostrar el contenido. Sigue siendo una barrera solo de
  // interfaz (ver comentario en js/auth.js) — la protección real
  // debe vivir en las reglas de Firebase / un backend.
  App.Auth.requireLogin("login.html");

  App.Nav.init("admin");
  document.getElementById("welcomeUser").textContent = App.Auth.currentUser() || "";

  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    crearProducto();
  });
});

function crearProducto() {
  const nameInput = document.getElementById("newName");
  const priceInput = document.getElementById("newPrice");
  const msg = document.getElementById("prodMsg");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (name === "" || !Number.isFinite(price) || price <= 0) {
    msg.innerHTML = '<div class="msg msg-error">Ingresa un nombre y un precio válido (mayor a 0).</div>';
    return;
  }

  const btn = document.getElementById("btnCrear");
  btn.disabled = true;
  msg.innerHTML = '<div class="msg msg-info">Creando pastelito…</div>';

  App.Api.createProduct({ name: name, price: price })
    .then(function () {
      msg.innerHTML = '<div class="msg msg-success">"' + name + '" fue agregado al menú 🎉</div>';
      nameInput.value = "";
      priceInput.value = "";
    })
    .catch(function (err) {
      console.error(err);
      msg.innerHTML = '<div class="msg msg-error">No se pudo crear el producto. Intenta de nuevo.</div>';
    })
    .finally(function () {
      btn.disabled = false;
    });
}
