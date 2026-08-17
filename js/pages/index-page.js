/* js/pages/index-page.js — glue code exclusivo de index.html */
let currentPage = 1;
const itemsPerPage = 6;
let menuData = {};

window.addEventListener("DOMContentLoaded", function () {
  App.Nav.init("inicio");
  loadAndRender();
});

function loadAndRender() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = '<p class="loading-state">Cargando pastelitos…</p>';

  App.Menu.load()
    .then(function (menu) {
      menuData = menu;
      renderMenu();
    })
    .catch(function (err) {
      console.error(err);
      grid.innerHTML = '<p class="empty-state">No se pudo cargar el menú. Intenta de nuevo más tarde.</p>';
    });
}

function getEmojiForName(name) {
  const n = name.toLowerCase();
  if (n.includes("cupcake") || n.includes("muffin")) return "🧁";
  if (n.includes("pastel") || n.includes("torta") || n.includes("cake")) return "🍰";
  if (n.includes("dona") || n.includes("donut")) return "🍩";
  if (n.includes("galleta") || n.includes("cookie")) return "🍪";
  if (n.includes("croissant") || n.includes("cuernito") || n.includes("panito")) return "🥐";
  if (n.includes("chocolate") || n.includes("brownie") || n.includes("choco")) return "🍫";
  if (n.includes("flan") || n.includes("gelatina") || n.includes("pudin")) return "🍮";
  if (n.includes("pie") || n.includes("pay") || n.includes("tarta")) return "🥧";
  if (n.includes("pan") || n.includes("baguette")) return "🍞";
  if (n.includes("cafe") || n.includes("coffee") || n.includes("tinto")) return "☕";
  if (n.includes("leche") || n.includes("milk")) return "🥛";
  if (n.includes("jugo") || n.includes("juice")) return "🧃";
  if (n.includes("fresa") || n.includes("strawberry")) return "🍓";
  if (n.includes("limon") || n.includes("lemon")) return "🍋";
  if (n.includes("manzana") || n.includes("apple")) return "🍎";
  if (n.includes("helado") || n.includes("ice cream")) return "🍦";
  if (n.includes("donu")) return "🍩";
  if (n.includes("brownie")) return "🍫";
  if (n.includes("muffin")) return "🧁";
  if (n.includes("macaron")) return "🍪";
  if (n.includes("cheesecake")) return "🍰";
  if (n.includes("alfajor")) return "🍪";
  if (n.includes("suspiro") || n.includes("merengue")) return "☁️";
  if (n.includes("canela") || n.includes("roll")) return "🌀";
  if (n.includes("tinto")) return "☕";
  
  // Comida colombiana (ejemplo)
  if (n.includes("bandeja paisa")) return "🍱";
  if (n.includes("arepa")) return "🫓";
  if (n.includes("empanada")) return "🥟";
  if (n.includes("ajiaco") || n.includes("sopa")) return "🥣";

  // Default emojis if no match
  const fallbacks = ["🧁", "🍰", "🍩", "🍪"];
  const index = name.length % fallbacks.length;
  return fallbacks[index];
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const paginationDiv = document.getElementById("pagination");
  
  const ids = Object.keys(menuData);
  if (ids.length === 0) {
    grid.innerHTML = '<p class="empty-state">Aún no hay pastelitos en el menú.</p>';
    paginationDiv.innerHTML = "";
    return;
  }

  // Lógica de paginación
  const totalPages = Math.ceil(ids.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const idsToShow = ids.slice(start, end);

  grid.innerHTML = "";
  idsToShow.forEach(function (id) {
    const item = menuData[id];
    const card = document.createElement("div");
    card.className = "menu-item";
    
    const emoji = getEmojiForName(item.name);
    
    card.innerHTML =
      '<span class="emoji">' + emoji + "</span>" +
      '<div class="name">' + escapeHtml(item.name) + "</div>" +
      '<div class="price">$' + item.price.toFixed(2) + "</div>";
    grid.appendChild(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById("pagination");
  paginationDiv.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentPage ? " active" : "");
    btn.textContent = i;
    btn.addEventListener("click", function() {
      currentPage = i;
      renderMenu();
      window.scrollTo({ top: document.querySelector('.card').offsetTop - 20, behavior: 'smooth' });
    });
    paginationDiv.appendChild(btn);
  }
}



function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
