/* =========================================================
   js/nav.js — App.Nav
   Pequeña utilidad compartida por todas las páginas para resaltar
   el enlace activo y reflejar si hay sesión iniciada.
   ========================================================= */
window.App = window.App || {};

App.Nav = (function () {
  "use strict";

  function highlightActive(pageId) {
    document.querySelectorAll("nav.mainnav a[data-page]").forEach(function (link) {
      if (link.getAttribute("data-page") === pageId) {
        link.classList.add("active");
      }
    });
  }

  function reflectSession() {
    const loginLink = document.getElementById("navLogin");
    const adminLink = document.getElementById("navAdmin");
    const logoutBtn = document.getElementById("navLogout");
    const logged = App.Auth.isLoggedIn();

    if (loginLink) loginLink.classList.toggle("hidden", logged);
    if (adminLink) adminLink.classList.toggle("hidden", !logged);
    if (logoutBtn) {
      logoutBtn.classList.toggle("hidden", !logged);
      logoutBtn.onclick = function () {
        App.Auth.logout();
        window.location.href = "index.html";
      };
    }
  }

  function init(pageId) {
    highlightActive(pageId);
    reflectSession();
  }

  return { init: init };
})();
