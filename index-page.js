/* js/pages/index-page.js — glue code exclusivo de index.html */
window.addEventListener("DOMContentLoaded", function () {
  App.Nav.init("inicio");
  renderMenu();
});

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const emojis = ["🧁", "🍰", "🍩", "🍪", "🥐", "🍫", "🍮", "🥧"];

  grid.innerHTML = '<p class="loading-state">Cargando pastelitos…</p>';

  App.Menu.load()
    .then(function (menu) {
      const ids = Object.keys(menu);
      if (ids.length === 0) {
        grid.innerHTML = '<p class="empty-state">Aún no hay pastelitos en el menú.</p>';
        return;
      }
      grid.innerHTML = "";
      ids.forEach(function (id, i) {
        const item = menu[id];
        const card = document.createElement("div");
        card.className = "menu-item";
        card.innerHTML =
          '<span class="emoji">' + emojis[i % emojis.length] + "</span>" +
          '<div class="name">' + escapeHtml(item.name) + "</div>" +
          '<div class="price">$' + item.price.toFixed(2) + "</div>";
        grid.appendChild(card);
      });
    })
    .catch(function (err) {
      console.error(err);
      grid.innerHTML = '<p class="empty-state">No se pudo cargar el menú. Intenta de nuevo más tarde.</p>';
    });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
