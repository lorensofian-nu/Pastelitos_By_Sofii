/* js/pages/login-page.js */
window.addEventListener("DOMContentLoaded", function () {
  App.Nav.init("login");

  // Si ya hay sesión activa, no tiene sentido mostrar el login otra vez
  if (App.Auth.isLoggedIn()) {
    window.location.href = "admin.html";
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value;
    const msg = document.getElementById("authMsg");

    const resultado = App.Auth.login(user, pass);
    if (resultado.ok) {
      window.location.href = "admin.html";
    } else {
      msg.innerHTML = '<div class="msg msg-error">' + resultado.message + "</div>";
    }
  });
});
