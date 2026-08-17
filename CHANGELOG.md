# CHANGELOG — Refactor "Pastelitos By Sofii"

Refactor del proyecto legacy (`index.html` único) siguiendo los 5 ejercicios del taller.

## Ejercicio 1 — MPA
- Se separó la vista única en 4 páginas: `index.html` (vitrina del menú),
  `pedido.html` (tomar pedido), `login.html` (acceso) y `admin.html` (crear productos, protegida).
- Se creó `css/styles.css` como única hoja de estilos, enlazada desde las 4 páginas.
- Se agregó una navegación compartida (`js/nav.js`) que resalta la página activa
  y muestra/oculta enlaces según haya sesión iniciada.

## Ejercicio 2 — Modularización
- Se eliminaron las variables globales sueltas del legacy
  (`items`, `total_global`, `menuData`, `isLogged`, `ADMIN_USER`, `ADMIN_PASS`).
- Todo el código vive ahora en módulos con patrón IIFE, colgados de un único
  objeto global `App` (`App.Api`, `App.Auth`, `App.Menu`, `App.Pedidos`, `App.Nav`):
  - `js/api.js` — acceso a Firebase Realtime Database.
  - `js/auth.js` — sesión (login/logout), guardada en `sessionStorage`.
  - `js/menu.js` — estado y caché del menú.
  - `js/pedidos.js` — cálculo de pedidos (subtotal, IVA, total).
  - `js/nav.js` — estado visual de la navegación.
  - `js/pages/*.js` — código específico de cada página (glue code + DOM).
- Se usó IIFE en vez de `<script type="module">` porque los módulos ES
  fallan por CORS al abrir el proyecto con doble clic (`file://`).

## Ejercicio 3 — Autenticación y seguridad
- Las credenciales dejaron de ser variables globales de `window` y ahora están
  encapsuladas dentro de `App.Auth`.
- La sesión ya no se guarda en una variable de JS (se perdía al refrescar);
  ahora usa `sessionStorage` y se consulta con `App.Auth.isLoggedIn()`.
- `admin.html` se protege llamando a `App.Auth.requireLogin()` antes de mostrar nada.
- Se documentó explícitamente (en `js/auth.js`) que esta protección es solo de
  interfaz y **no reemplaza** una autenticación real. Se agregó:
  - `firebase-rules-example.json`: reglas de Realtime Database que restringen
    la escritura a usuarios autenticados.
  - Un comentario TODO con el código de ejemplo para migrar a Firebase Authentication.

## Ejercicio 4 — Limpieza y pruebas
- Se eliminó la función muerta `funcionObsoletaCalculoAnterior`.
- Validaciones más estrictas y explícitas en `App.Pedidos.validar` y en el
  formulario de `admin.html` (cantidad entera > 0, precio > 0, item seleccionado).
- Mensajes de error específicos en pantalla (se quitó el `alert("Error en datos")` genérico).
- Se agregaron "pruebas" manuales rápidas para la lógica de cálculo:
  `App.Pedidos.__test()` (ejecutable desde la consola del navegador).

## Ejercicio 5 — Buenas prácticas
- Lógica de negocio (`App.Pedidos.calcular`, `App.Pedidos.validar`) separada por
  completo de la manipulación del DOM, que ahora vive solo en `js/pages/pedido-page.js`.
- Manejo de errores con `.catch()` en todas las llamadas a Firebase, con mensajes
  de feedback visibles para el usuario (clases `.msg-error`, `.msg-success`, `.msg-info`).
- Nombres de variables descriptivos (`itemId`, `cantidad`, `precioUnitario`) en vez
  de `a`, `b`, `p`.

## Diseño visual
- Nueva identidad "Pastelitos By Sofii": paleta vibrante amarillo mantequilla + lila,
  tipografía Fredoka/Quicksand, tarjetas redondeadas y un divisor tipo "cortina de
  repostería" como elemento distintivo.
