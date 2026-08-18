# Pastelitos By Sofii

Aplicación web de pedidos para repostería. MPA estática conectada a Firebase Realtime Database, refactorizada desde un proyecto legacy siguiendo un taller de 5 ejercicios.

## Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase Realtime Database
- **Servidor local:** Node.js (`server.js`)

## Inicio rápido

**Prerrequisitos:** [Node.js](https://nodejs.org/) v14+

```bash
# Opción 1 — Servidor local
node server.js
# Abrir http://localhost:3009

# Opción 2 — Abrir directamente
# Doble clic en index.html (funciona sin servidor)
```

## Estructura del proyecto

```
├── index.html              → Vitrina del menú
├── pedido.html             → Formulario de pedido
├── login.html              → Acceso al panel admin
├── admin.html              → Crear productos (requiere sesión)
├── server.js               → Servidor de desarrollo local
├── css/
│   └── styles.css          → Estilos globales
├── js/
│   ├── api.js              → Acceso a Firebase RTDB
│   ├── auth.js             → Sesión / login / logout
│   ├── menu.js             → Estado y caché del menú
│   ├── pedidos.js          → Lógica de cálculo de pedidos
│   ├── nav.js              → Navegación visual
│   └── pages/              → Glue code por página
├── images/menu/            → Imágenes del menú
└── firebase-rules-example.json → Reglas de seguridad sugeridas
```

## Firebase

Lee y escribe en `stock-flow-2e23e-default-rtdb.firebaseio.com/menu.json`.

La escritura desde `admin.html` no está protegida a nivel de servidor. Ver `firebase-rules-example.json` para reglas sugeridas y `js/auth.js` para la nota de migración a Firebase Authentication.

**Credenciales de prueba:** usuario `admin`, contraseña `admin` (solo para fines del taller).

## Créditos

Proyecto base del taller de refactorización, transformado de un `index.html` monolítico a MPA modular.
