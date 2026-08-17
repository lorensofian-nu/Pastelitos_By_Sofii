# Pastelitos By Sofii

MPA (Multiple Page Application) de pedidos para una repostería, conectada a
Firebase Realtime Database. Refactor del proyecto legacy siguiendo los 5
ejercicios del taller (ver `CHANGELOG.md` para el detalle de qué cambió y por qué).

## Cómo abrirlo
Es un proyecto estático: abre `index.html` con doble clic (o sirviéndolo con
un servidor local, ej. `npx serve .`).

## Estructura

```
index.html          → Vitrina del menú (público)
pedido.html          → Tomar pedido (público)
login.html            → Acceso al panel (público)
admin.html            → Crear productos (protegida, requiere sesión)
css/
  styles.css            → Única hoja de estilos de toda la app
js/
  api.js                → App.Api    — acceso a Firebase Realtime Database
  auth.js               → App.Auth   — sesión / login / logout
  menu.js               → App.Menu   — estado y caché del menú
  pedidos.js             → App.Pedidos — cálculo y validación de pedidos (lógica pura)
  nav.js                 → App.Nav   — estado visual de la navegación
  pages/
    index-page.js         → glue code de index.html
    pedido-page.js         → glue code de pedido.html
    login-page.js           → glue code de login.html
    admin-page.js            → glue code de admin.html
firebase-rules-example.json → reglas de seguridad sugeridas para Realtime Database
CHANGELOG.md            → detalle de la refactorización, ejercicio por ejercicio
```

## Firebase
Lee y escribe sobre:
`https://stock-flow-2e23e-default-rtdb.firebaseio.com/menu.json`

La escritura (`admin.html`) no está protegida a nivel de servidor todavía.
Ver `js/auth.js` y `firebase-rules-example.json` para la nota de seguridad y
el siguiente paso recomendado (Firebase Authentication + reglas de RTDB).

## Demo de acceso
Usuario: `admin` — Contraseña: `admin` (solo para fines del taller, ver nota de seguridad).

## Créditos
Proyecto base (legacy) del taller de refactorización, transformado a MPA modular.
