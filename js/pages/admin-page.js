/* js/pages/admin-page.js — Panel admin con CRUD + Dashboard + Charts */
window.addEventListener("DOMContentLoaded", function () {
  App.Auth.requireLogin("login.html");

  App.Nav.init("admin");
  document.getElementById("welcomeUser").textContent = App.Auth.currentUser() || "";

  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    crearProducto();
  });

  document.getElementById("editForm").addEventListener("submit", function (e) {
    e.preventDefault();
    guardarEdicion();
  });

  document.getElementById("btnCancelEdit").addEventListener("click", cerrarModal);

  document.getElementById("editModal").addEventListener("click", function (e) {
    if (e.target === this) cerrarModal();
  });

  cargarProductos();
  
  // Esperar a que Chart.js esté disponible antes de cargar el dashboard
  function waitForChartjs() {
    if (typeof Chart !== "undefined") {
      cargarDashboard();
      cargarPedidos();
    } else {
      // Si Chart.js no está cargado, esperar y volver a intentar
      setTimeout(waitForChartjs, 100);
    }
  }
  
  // Iniciar la espera por Chart.js (se carga desde CDN en admin.html)
  waitForChartjs();
});

/* ========== Variables de paginación ========== */
var currentPageProductos = 1;
var productosPerPage = 6;
var menuCache = {};

/* ========== Variables de pedidos ========== */
var currentPagePedidos = 1;
var pedidosPerPage = 10;
var pedidosCache = {};

/* ========== Gráficos Chart.js ========== */
var chartBarrasInstance = null;
var chartDonaInstance = null;
var chartEntregaInstance = null;
var chartEstadoInstance = null;

var chartColors = [
  "#D4A5E8", "#F7C6D0", "#A8D8B9", "#F9D89C", "#B5D4F1",
  "#E8B5CE", "#C3E6CB", "#F5D5A8", "#D1C4E9", "#FFE0B2"
];

/* ========== Dashboard / Stats ========== */

function cargarDashboard() {
  Promise.all([App.Api.getPedidos(), App.Api.getMenu()])
    .then(function (results) {
      var pedidos = results[0];
      var menu = results[1];

      var totalPedidos = Object.keys(pedidos).length;
      var totalProductos = Object.keys(menu).length;

      var ingresos = 0;
      var ventasPorProducto = {};
      var tiendaCount = 0;
      var domicilioCount = 0;
      var enProcesoCount = 0;
      var entregadoCount = 0;

      Object.keys(pedidos).forEach(function (id) {
        var p = pedidos[id];
        
        // Asegurar que los valores sean números
        ingresos += Number(p.total || 0);

        // Contar tipo de entrega (manejar casos donde entrega no existe o tiene formato diferente)
        var tipoEntrega = (p.entrega && p.entrega.tipo) ? p.entrega.tipo.toLowerCase() : "tienda";
        if (tipoEntrega === "domicilio") {
          domicilioCount++;
        } else {
          tiendaCount++;
        }

        // Contar estado
        var estado = (p.estado) ? p.estado.toLowerCase() : "en proceso";
        if (estado === "entregado") {
          entregadoCount++;
        } else {
          enProcesoCount++;
        }

        var key = p.productId || p.productName;
        if (!ventasPorProducto[key]) {
          ventasPorProducto[key] = { name: p.productName || "Desconocido", quantity: 0, total: 0 };
        }
        ventasPorProducto[key].quantity += Number(p.quantity || 0);
        ventasPorProducto[key].total += Number(p.total || 0);
      });

      var promedio = totalPedidos > 0 ? ingresos / totalPedidos : 0;

      document.getElementById("statTotalPedidos").textContent = totalPedidos;
      document.getElementById("statTotalProductos").textContent = totalProductos;
      document.getElementById("statIngresos").textContent = "$" + Number(ingresos).toFixed(0);
      document.getElementById("statPromedio").textContent = "$" + Number(promedio).toFixed(0);
      document.getElementById("statTienda").textContent = tiendaCount;
      document.getElementById("statDomicilio").textContent = domicilioCount;
      document.getElementById("statEnProceso").textContent = enProcesoCount;
      document.getElementById("statEntregado").textContent = entregadoCount;

      var sorted = Object.values(ventasPorProducto).sort(function (a, b) {
        return b.quantity - a.quantity;
      });

      renderCharts(sorted, totalProductos);
      renderTopList(sorted);
      renderEntregaChart(tiendaCount, domicilioCount);
      renderEstadoChart(enProcesoCount, entregadoCount);
    })
    .catch(function (err) {
      console.error("Error cargando dashboard:", err);
    });
}

function renderCharts(sorted, totalProductos) {
  if (typeof Chart === "undefined") {
    document.getElementById("topProductos").innerHTML =
      '<p class="msg msg-info">Chart.js no se pudo cargar. Solo se muestra la lista.</p>';
    return;
  }
  
  // Verificar que los contenedores canvas existan
  var chartBarrasCanvas = document.getElementById("chartBarras");
  var chartDonaCanvas = document.getElementById("chartDona");
  
  if (!chartBarrasCanvas || !chartDonaCanvas) {
    console.warn("Contenedores de gráficos no encontrados");
    return;
  }

  // --- Gráfico de barras: Top productos más vendidos ---
  var barrasLabels = [];
  var barrasData = [];
  var barrasColors = [];
  sorted.slice(0, 8).forEach(function (item, i) {
    barrasLabels.push(item.name);
    barrasData.push(item.quantity);
    barrasColors.push(chartColors[i % chartColors.length]);
  });

  if (chartBarrasInstance) chartBarrasInstance.destroy();

  var ctxBarras = document.getElementById("chartBarras").getContext("2d");
  chartBarrasInstance = new Chart(ctxBarras, {
    type: "bar",
    data: {
      labels: barrasLabels,
      datasets: [{
        label: "Unidades vendidas",
        data: barrasData,
        backgroundColor: barrasColors,
        borderColor: barrasColors.map(function (c) { return c; }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#3A2E4D",
          titleFont: { family: "Fredoka", size: 14 },
          bodyFont: { family: "Quicksand", size: 13 },
          cornerRadius: 12,
          padding: 12,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { family: "Quicksand", weight: 600 },
            color: "#6B5C82"
          },
          grid: { color: "rgba(177,129,224,0.15)" }
        },
        x: {
          ticks: {
            font: { family: "Quicksand", weight: 600, size: 11 },
            color: "#6B5C82",
            maxRotation: 45,
            minRotation: 0,
          },
          grid: { display: false }
        }
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart"
      }
    }
  });

  // --- Gráfico dona: Distribución de ingresos ---
  var donaLabels = [];
  var donaData = [];
  var donaColors = [];
  sorted.slice(0, 8).forEach(function (item, i) {
    donaLabels.push(item.name);
    donaData.push(Number(item.total.toFixed(2)));
    donaColors.push(chartColors[i % chartColors.length]);
  });

  // "Otros" si hay más de 8
  if (sorted.length > 8) {
    var otrosTotal = sorted.slice(8).reduce(function (sum, item) { return sum + item.total; }, 0);
    donaLabels.push("Otros");
    donaData.push(Number(otrosTotal.toFixed(2)));
    donaColors.push("#D1D5DB");
  }

  if (chartDonaInstance) chartDonaInstance.destroy();

  var ctxDona = document.getElementById("chartDona").getContext("2d");
  chartDonaInstance = new Chart(ctxDona, {
    type: "doughnut",
    data: {
      labels: donaLabels,
      datasets: [{
        data: donaData,
        backgroundColor: donaColors,
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Quicksand", size: 12, weight: 600 },
            color: "#3A2E4D",
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: "#3A2E4D",
          titleFont: { family: "Fredoka", size: 14 },
          bodyFont: { family: "Quicksand", size: 13 },
          cornerRadius: 12,
          padding: 12,
          callbacks: {
            label: function (ctx) {
              var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
              var pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
              return " " + ctx.label + ": $" + ctx.raw.toFixed(2) + " (" + pct + "%)";
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: "easeOutQuart"
      }
    }
  });
}

function renderTopList(sorted) {
  var topDiv = document.getElementById("topProductos");

  if (sorted.length === 0) {
    topDiv.innerHTML = '<p class="msg msg-info">Aún no hay ventas registradas.</p>';
    return;
  }

  var html = '<h3>Ranking de ventas</h3><div class="top-list">';
  sorted.slice(0, 5).forEach(function (item, i) {
    var medal = "";
    if (i === 0) medal = "🥇";
    else if (i === 1) medal = "🥈";
    else if (i === 2) medal = "🥉";
    else medal = "#" + (i + 1);

    html +=
      '<div class="top-item">' +
      '<span class="top-rank">' + medal + '</span>' +
      '<span class="top-name">' + escapeHtml(item.name) + '</span>' +
      '<span class="top-qty">' + item.quantity + ' uds · $' + Number(item.total).toFixed(2) + '</span>' +
      '</div>';
  });
  html += '</div>';
  topDiv.innerHTML = html;
}

function renderEntregaChart(tiendaCount, domicilioCount) {
  if (typeof Chart === "undefined") return;
  
  var chartEntregaCanvas = document.getElementById("chartEntrega");
  if (!chartEntregaCanvas) {
    console.warn("Contenedor chartEntrega no encontrado");
    return;
  }

  if (chartEntregaInstance) chartEntregaInstance.destroy();

  var ctx = chartEntregaCanvas.getContext("2d");
  chartEntregaInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Recoger en tienda", "Domicilio"],
      datasets: [{
        data: [tiendaCount, domicilioCount],
        backgroundColor: ["#D4A5E8", "#F7C6D0"],
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Quicksand", size: 12, weight: 600 },
            color: "#3A2E4D",
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: "#3A2E4D",
          titleFont: { family: "Fredoka", size: 14 },
          bodyFont: { family: "Quicksand", size: 13 },
          cornerRadius: 12,
          padding: 12,
        }
      },
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: "easeOutQuart"
      }
    }
  });
}

function renderEstadoChart(enProcesoCount, entregadoCount) {
  if (typeof Chart === "undefined") return;
  
  var chartEstadoCanvas = document.getElementById("chartEstado");
  if (!chartEstadoCanvas) {
    console.warn("Contenedor chartEstado no encontrado");
    return;
  }

  if (chartEstadoInstance) chartEstadoInstance.destroy();

  var ctx = chartEstadoCanvas.getContext("2d");
  chartEstadoInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["En proceso", "Entregado"],
      datasets: [{
        data: [enProcesoCount, entregadoCount],
        backgroundColor: ["#F7C6D0", "#A8D8B9"],
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "Quicksand", size: 12, weight: 600 },
            color: "#3A2E4D",
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: "#3A2E4D",
          titleFont: { family: "Fredoka", size: 14 },
          bodyFont: { family: "Quicksand", size: 13 },
          cornerRadius: 12,
          padding: 12,
          callbacks: {
            label: function (ctx) {
              var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
              var pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
              return " " + ctx.label + ": " + ctx.raw + " (" + pct + "%)";
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: "easeOutQuart"
      }
    }
  });
}

/* ========== CRUD: Crear ========== */

function crearProducto() {
  var nameInput = document.getElementById("newName");
  var priceInput = document.getElementById("newPrice");
  var msg = document.getElementById("prodMsg");

  var name = nameInput.value.trim();
  var price = Number(priceInput.value);

  if (name === "" || !Number.isFinite(price) || price <= 0) {
    msg.innerHTML = '<div class="msg msg-error">Ingresa un nombre y un precio válido (mayor a 0).</div>';
    return;
  }

  var btn = document.getElementById("btnCrear");
  btn.disabled = true;
  msg.innerHTML = '<div class="msg msg-info">Creando pastelito…</div>';

  App.Api.createProduct({ name: name, price: price })
    .then(function () {
      msg.innerHTML = '<div class="msg msg-success">"' + escapeHtml(name) + '" fue agregado al menú.</div>';
      nameInput.value = "";
      priceInput.value = "";
      currentPageProductos = 1;
      cargarProductos();
      cargarDashboard();
    })
    .catch(function (err) {
      console.error(err);
      msg.innerHTML = '<div class="msg msg-error">No se pudo crear el producto. Intenta de nuevo.</div>';
    })
    .finally(function () {
      btn.disabled = false;
    });
}

/* ========== CRUD: Listar con paginación ========== */

function cargarProductos() {
  var container = document.getElementById("productosList");
  container.innerHTML = '<p class="loading-state">Cargando productos…</p>';

  App.Api.getMenu()
    .then(function (menu) {
      menuCache = menu;
      renderProductosPage();
    })
    .catch(function (err) {
      console.error(err);
      container.innerHTML = '<div class="msg msg-error">No se pudieron cargar los productos.</div>';
    });
}

function renderProductosPage() {
  var container = document.getElementById("productosList");
  var paginationDiv = document.getElementById("productosPagination");
  var ids = Object.keys(menuCache);

  if (ids.length === 0) {
    container.innerHTML = '<p class="empty-state">Aún no hay productos en el menú.</p>';
    paginationDiv.innerHTML = "";
    return;
  }

  var totalPages = Math.ceil(ids.length / productosPerPage);
  if (currentPageProductos > totalPages) currentPageProductos = totalPages;
  if (currentPageProductos < 1) currentPageProductos = 1;

  var start = (currentPageProductos - 1) * productosPerPage;
  var end = start + productosPerPage;
  var idsToShow = ids.slice(start, end);

  var html = '<table class="productos-table">' +
    '<thead><tr><th>#</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead><tbody>';

  idsToShow.forEach(function (id, idx) {
    var p = menuCache[id];
    var num = start + idx + 1;
    html +=
      '<tr data-id="' + id + '">' +
      '<td class="row-num">' + num + '</td>' +
      '<td>' + escapeHtml(p.name) + '</td>' +
      '<td class="row-price">$' + Number(p.price).toFixed(2) + '</td>' +
      '<td class="acciones">' +
        '<button class="btn btn-sm btn-primary" data-action="edit" data-name="' + escapeHtml(p.name) + '" data-price="' + p.price + '">Editar</button>' +
        '<button class="btn btn-sm btn-danger" data-action="delete" data-name="' + escapeHtml(p.name) + '">Eliminar</button>' +
      '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  // Event delegation
  container.querySelector("tbody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var row = btn.closest("tr");
    var id = row.getAttribute("data-id");
    var action = btn.getAttribute("data-action");

    if (action === "edit") {
      abrirEditar(id, btn.getAttribute("data-name"), Number(btn.getAttribute("data-price")));
    } else if (action === "delete") {
      eliminarProducto(id, btn.getAttribute("data-name"));
    }
  });

  // Paginación
  renderPaginationProductos(totalPages);
}

function renderPaginationProductos(totalPages) {
  var paginationDiv = document.getElementById("productosPagination");
  paginationDiv.innerHTML = "";

  if (totalPages <= 1) return;

  // Botón anterior
  if (currentPageProductos > 1) {
    var prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.textContent = "\u25C0";
    prevBtn.addEventListener("click", function () {
      currentPageProductos--;
      renderProductosPage();
    });
    paginationDiv.appendChild(prevBtn);
  }

  for (var i = 1; i <= totalPages; i++) {
    (function (page) {
      var btn = document.createElement("button");
      btn.className = "page-btn" + (page === currentPageProductos ? " active" : "");
      btn.textContent = page;
      btn.addEventListener("click", function () {
        currentPageProductos = page;
        renderProductosPage();
      });
      paginationDiv.appendChild(btn);
    })(i);
  }

  // Botón siguiente
  if (currentPageProductos < totalPages) {
    var nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.textContent = "\u25B6";
    nextBtn.addEventListener("click", function () {
      currentPageProductos++;
      renderProductosPage();
    });
    paginationDiv.appendChild(nextBtn);
  }
}

/* ========== CRUD: Editar ========== */

function abrirEditar(id, name, price) {
  document.getElementById("editId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editPrice").value = price;
  document.getElementById("editMsg").innerHTML = "";
  document.getElementById("editModal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("editModal").classList.add("hidden");
}

function guardarEdicion() {
  var id = document.getElementById("editId").value;
  var name = document.getElementById("editName").value.trim();
  var price = Number(document.getElementById("editPrice").value);
  var msg = document.getElementById("editMsg");

  if (name === "" || !Number.isFinite(price) || price <= 0) {
    msg.innerHTML = '<div class="msg msg-error">Nombre y precio son obligatorios.</div>';
    return;
  }

  msg.innerHTML = '<div class="msg msg-info">Guardando…</div>';

  App.Api.updateProduct(id, { name: name, price: price })
    .then(function () {
      msg.innerHTML = '<div class="msg msg-success">Producto actualizado.</div>';
      setTimeout(function () {
        cerrarModal();
        cargarProductos();
        cargarDashboard();
      }, 800);
    })
    .catch(function (err) {
      console.error(err);
      msg.innerHTML = '<div class="msg msg-error">No se pudo actualizar. Intenta de nuevo.</div>';
    });
}

/* ========== CRUD: Eliminar ========== */

function eliminarProducto(id, name) {
  if (!confirm('¿Eliminar "' + name + '" del menú? Esta acción no se puede deshacer.')) {
    return;
  }

  var msg = document.getElementById("productosMsg");
  msg.innerHTML = '<div class="msg msg-info">Eliminando…</div>';

  App.Api.deleteProduct(id)
    .then(function () {
      msg.innerHTML = '<div class="msg msg-success">"' + name + '" fue eliminado del menú.</div>';
      cargarProductos();
      cargarDashboard();
    })
    .catch(function (err) {
      console.error(err);
      msg.innerHTML = '<div class="msg msg-error">No se pudo eliminar el producto.</div>';
    });
}

/* ========== Pedidos ========== */

function cargarPedidos() {
  var container = document.getElementById("pedidosList");
  container.innerHTML = '<p class="loading-state">Cargando pedidos…</p>';

  App.Api.getPedidos()
    .then(function (pedidos) {
      pedidosCache = pedidos;
      renderPedidosPage();
    })
    .catch(function (err) {
      console.error(err);
      container.innerHTML = '<div class="msg msg-error">No se pudieron cargar los pedidos.</div>';
    });
}

function renderPedidosPage() {
  var container = document.getElementById("pedidosList");
  var paginationDiv = document.getElementById("pedidosPagination");
  var ids = Object.keys(pedidosCache);

  if (ids.length === 0) {
    container.innerHTML = '<p class="empty-state">Aún no hay pedidos registrados.</p>';
    paginationDiv.innerHTML = "";
    return;
  }

  var totalPages = Math.ceil(ids.length / pedidosPerPage);
  if (currentPagePedidos > totalPages) currentPagePedidos = totalPages;
  if (currentPagePedidos < 1) currentPagePedidos = 1;

  var start = (currentPagePedidos - 1) * pedidosPerPage;
  var end = start + pedidosPerPage;
  var idsToShow = ids.slice(start, end);

  var html = '<table class="pedidos-table">' +
    '<thead><tr><th>#</th><th>Producto</th><th>Cantidad</th><th>Total</th><th>Entrega</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';

  idsToShow.forEach(function (id, idx) {
    var p = pedidosCache[id];
    var num = start + idx + 1;
    var estado = p.estado || "en proceso";
    var badgeClass = estado === "entregado" ? "badge--entregado" : "badge--en-proceso";
    var tipoEntrega = (p.entrega && p.entrega.tipo) ? p.entrega.tipo : "tienda";
    var textoEntrega = tipoEntrega === "domicilio" ? "Domicilio" : "Tienda";

    html +=
      '<tr data-id="' + id + '">' +
      '<td class="row-num">' + num + '</td>' +
      '<td>' + escapeHtml(p.productName || "Desconocido") + '</td>' +
      '<td>' + (p.quantity || 0) + '</td>' +
      '<td class="row-total">$' + Number(p.total || 0).toFixed(0) + '</td>' +
      '<td>' + textoEntrega + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + estado + '</span></td>' +
      '<td class="acciones">' +
        '<button class="btn btn-sm btn-primary" data-action="toggle-estado" data-id="' + id + '" data-estado="' + estado + '">Cambiar estado</button>' +
      '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  // Event delegation para cambiar estado
  container.querySelector("tbody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action='toggle-estado']");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    var estadoActual = btn.getAttribute("data-estado");
    toggleEstadoPedido(id, estadoActual, btn);
  });

  // Paginación
  renderPaginationPedidos(totalPages);
}

function toggleEstadoPedido(id, estadoActual, btn) {
  var nuevoEstado = estadoActual === "en proceso" ? "entregado" : "en proceso";
  
  // Mostrar mensaje de carga
  var msg = document.getElementById("pedidosMsg");
  msg.innerHTML = '<div class="msg msg-info">Actualizando estado…</div>';

  // Actualizar en Firebase
  App.Api.patchPedido(id, { estado: nuevoEstado })
    .then(function () {
      // Actualizar cache local
      pedidosCache[id].estado = nuevoEstado;
      msg.innerHTML = '<div class="msg msg-success">Estado actualizado.</div>';
      
      // Recargar la lista para reflejar el cambio
      setTimeout(function () {
        msg.innerHTML = "";
        renderPedidosPage();
      }, 800);
    })
    .catch(function (err) {
      console.error(err);
      msg.innerHTML = '<div class="msg msg-error">No se pudo actualizar el estado.</div>';
    });
}

function renderPaginationPedidos(totalPages) {
  var paginationDiv = document.getElementById("pedidosPagination");
  paginationDiv.innerHTML = "";

  if (totalPages <= 1) return;

  // Botón anterior
  if (currentPagePedidos > 1) {
    var prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.textContent = "\u25C0";
    prevBtn.addEventListener("click", function () {
      currentPagePedidos--;
      renderPedidosPage();
    });
    paginationDiv.appendChild(prevBtn);
  }

  for (var i = 1; i <= totalPages; i++) {
    (function (page) {
      var btn = document.createElement("button");
      btn.className = "page-btn" + (page === currentPagePedidos ? " active" : "");
      btn.textContent = page;
      btn.addEventListener("click", function () {
        currentPagePedidos = page;
        renderPedidosPage();
      });
      paginationDiv.appendChild(btn);
    })(i);
  }

  // Botón siguiente
  if (currentPagePedidos < totalPages) {
    var nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.textContent = "\u25B6";
    nextBtn.addEventListener("click", function () {
      currentPagePedidos++;
      renderPedidosPage();
    });
    paginationDiv.appendChild(nextBtn);
  }
}

/* ========== Utilidad ========== */

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
