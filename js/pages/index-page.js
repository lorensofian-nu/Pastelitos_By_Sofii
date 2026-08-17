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

function getImageForName(name) {
  const n = name.toLowerCase();
  // Repostería
  if (n.includes("cupcake"))                          return "images/menu/cupcake_vainilla.jpg";
  if (n.includes("brownie"))                          return "images/menu/brownie_chocolate.jpg";
  if (n.includes("galleta") || n.includes("cookie"))  return "images/menu/galleta_mantequilla.jpg";
  if (n.includes("muffin"))                           return "images/menu/muffin_arandanos.jpg";
  if (n.includes("pastel") || n.includes("torta") || n.includes("cake")) return "images/menu/pastel_fresa.jpg";
  if (n.includes("donut") || n.includes("dona") || n.includes("donu"))   return "images/menu/donut_glaseado.jpg";
  if (n.includes("croissant") || n.includes("cuernito"))                 return "images/menu/croissant.jpg";
  // Comida
  if (n.includes("bandeja"))                          return "images/menu/bandeja_paisa.jpg";
  if (n.includes("papa") || n.includes("frita"))      return "images/menu/papas_fritas.jpg";
  if (n.includes("pasta") || n.includes("espagueti") || n.includes("fideos")) return "images/menu/pastas.jpg";
  if (n.includes("hambur") || n.includes("burger"))   return "images/menu/hamburguesa.jpg";
  return null; // sin imagen → usará emoji
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

    const imgSrc = item.image || getImageForName(item.name);
    const mediaHtml = imgSrc
      ? '<img class="menu-img" src="' + imgSrc + '" alt="' + escapeHtml(item.name) + '" loading="lazy">'
      : '<span class="emoji">🧁</span>';

    card.innerHTML =
      mediaHtml +
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
