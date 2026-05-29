# Auth + Backend Integration Design

**Date:** 2026-04-19  
**Branch:** cachee  
**Scope:** Login screen, JWT cookie auth, role-based routing, API service layer, backend-connected screens (Inicio, Rutas, NuevaEncuesta), and extensible stub routes.

---

## 1. Auth & Login

### Login screen (`src/pages/Login.jsx`)
- Layout standalone (sin MainLayout, sin nav).
- Campos: `numero_identificacion` (texto/número) + `contraseña` (password).
- Botón con estado loading mientras espera respuesta.
- Error inline bajo el formulario (no modal).
- Al éxito: `AuthContext.login(userData)` → redirige a `/`.

### Endpoints involucrados
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Recibe `{ numero_identificacion, contraseña }`. Servidor setea cookie httpOnly con JWT. Retorna `{ numero_identificacion, nombre, apellido, correo, id_roles, nombre_rol }`. |
| GET | `/api/auth/verify` | Valida la cookie. Retorna mismo shape de usuario. Ya implementado en AuthContext. |
| POST | `/api/auth/logout` | Invalida la cookie. Ya implementado en AuthContext. |

### AuthContext (ajustes)
- `login(userData)` guarda el objeto de usuario en estado y navega a `/`.
- `user` expone: `numero_identificacion`, `nombre`, `apellido`, `correo`, `id_roles`, `nombre_rol`.
- `isLoading` bloquea el render de rutas hasta que `verify` resuelva (evita flash a `/login`).

---

## 2. Protección de rutas

### Componentes existentes a ajustar
- **`ProtectedRoute`** — redirige a `/login` si `!isAuthenticated`. Muestra spinner mientras `isLoading`.
- **`RoleRoute`** — acepta prop `allowedRoles: string[]`. Si `user.id_roles` no está en la lista, muestra pantalla "Sin acceso" en lugar de redirigir.

### Matriz de acceso
| Ruta | Encuestador | Supervisor | Admin |
|------|-------------|------------|-------|
| `/` | ✓ | ✓ | ✓ |
| `/calendario` | ✓ | ✓ | ✓ |
| `/nueva-encuesta` | ✓ | ✓ | ✓ |
| `/reportes` | ✗ | ✓ | ✓ |
| `/configuracion` | ✗ | ✗ | ✓ |

Los valores de `id_roles` que llegan del backend son los `roles_id` de la tabla `ROLES` (ej. `"encuestador"`, `"supervisor"`, `"admin"`).

---

## 3. Capa de servicios (`src/services/`)

### `api.js` — base fetch
```
apiFetch(endpoint, options = {})
  - Siempre incluye credentials: 'include' (para la cookie JWT)
  - Base URL: import.meta.env.VITE_PATH
  - Si response.ok → retorna data (JSON)
  - Si !response.ok → lanza Error con mensaje del servidor o mensaje genérico en español
  - Si TypeError (sin red) → lanza Error con mensaje "Sin conexión"
```

### `auth.service.js`
- `login({ numero_identificacion, contraseña })` → POST `/auth/login`
- `logout()` → POST `/auth/logout`
- `verify()` → GET `/auth/verify`

### `rutas.service.js`
- `getTurnosByFecha(fecha: string)` → GET `/turnos?fecha=YYYY-MM-DD`
  - Respuesta esperada: array de `PROGRAMACION_TURNOS` con `rutas_visitas` embebidas, cada una con su `sujeto`.
  ```json
  [{
    "programacion_turnos": 1,
    "fecha": "2026-04-19",
    "hora_inicio": "09:00",
    "hora_fin": "11:00",
    "tipo_actividad": "Inspección",
    "rutas_visitas": [{
      "id_rutas": 5,
      "estado": "Pendiente",
      "fecha_programada": "2026-04-19",
      "sujeto": {
        "id_sujeto": 12,
        "razon_social": "Panadería El Trigo",
        "direccion_fisica": "Calle 45 # 12-34",
        "barrio": "Centro",
        "zona": "Urbana",
        "latitud": 4.123,
        "longitud": -74.456
      }
    }]
  }]
  ```

### `sujetos.service.js`
- `searchSujetos(query: string)` → GET `/sujetos?q=query`
  - Busca por `razon_social`, `nit`, `barrio`.
  - Respuesta: array de `{ id_sujeto, nit, razon_social, direccion_fisica, barrio, zona }`.

### `encuestas.service.js`
- `getTiposDocumento()` → GET `/tipos-documento`
  - Respuesta: `[{ id_tipo_documento, nombre_documento }]`
- `crearDocumento(formData: FormData)` → POST `/documentos-legales` (multipart)
  - FormData contiene: `id_sujeto`, `id_tipo_documento`, `id_acta` (generado), archivos como `evidencias`.

---

## 4. Pantallas

### `src/pages/Login.jsx` (nueva)
- Diseño centrado verticalmente, logo de la app arriba.
- Form con `numero_identificacion` + `contraseña`.
- Submit → `authService.login(...)` → `AuthContext.login(userData)`.
- Error se muestra inline con mensaje del servicio.
- Si ya está autenticado al llegar, redirige a `/`.

### `src/pages/Inicio.jsx` (actualizar)
- **Perfil:** `nombre`, `apellido`, `numero_identificacion`, badge con `nombre_rol`.
- **Programa:** nombre del programa asignado. GET `/usuarios/me/programa` o incluido en verify.
- **Pendientes offline:** cuenta registros en IndexedDB `encuestas_pendientes`. Badge visible en el perfil.
- **Sincronizar:** botón que itera pendientes en IndexedDB, llama `crearDocumento()` por cada uno, y al éxito lo elimina de IndexedDB.
- **Actividad reciente:** GET `/rutas-visitas/recientes` → últimas 5 visitas del usuario con `estado` y `razon_social`.

### `src/pages/Rutas.jsx` (actualizar)
- Calendario navega por fecha. Estado local `selectedDate` (default: hoy).
- Al cambiar fecha → llama `getTurnosByFecha(selectedDate)`.
- Loading skeleton mientras carga (reemplaza spinner actual).
- Lista de tarjetas con datos reales de `RUTAS_VISITAS` + `SUJETOS`.
- Estado coloreado: `Pendiente` → ámbar, `En Progreso` → azul, `Completado` → verde, `Futuro` → gris.
- Sin conexión: el SW sirve la caché (StaleWhileRevalidate GET). Si no hay caché, mensaje "Sin datos para esta fecha".

### `src/pages/NuevaEncuesta.jsx` (actualizar)
- **Búsqueda de sujeto:** input con debounce 400ms → `searchSujetos(q)`. Muestra lista desplegable. Al seleccionar, guarda `id_sujeto`.
- **Tipo de documento:** select que carga `getTiposDocumento()` al montar.
- **ID Acta:** se genera automáticamente con timestamp (`ACTA-{timestamp}`) en lugar de hardcodear.
- **Archivos:** sin cambios.
- **Submit online:** `crearDocumento(FormData)`.
- **Submit offline:** guarda en IndexedDB incluyendo `id_sujeto`, `id_tipo_documento`, `id_acta`, archivos.

### `src/pages/Reportes.jsx` (stub nueva)
- Pantalla simple: ícono + "Próximamente" + descripción.
- Solo accesible para Supervisor y Admin.

### `src/pages/Configuracion.jsx` (stub nueva)
- Igual que Reportes. Solo accesible para Admin.

---

## 5. Routing final (`src/App.jsx`)

```
/login              → Login (sin AuthProvider guard, pero redirige si ya autenticado)
/                   → ProtectedRoute → MainLayout → Inicio
/calendario         → ProtectedRoute → MainLayout → Rutas
/nueva-encuesta     → ProtectedRoute → NuevaEncuesta
/reportes           → ProtectedRoute → RoleRoute([supervisor, admin]) → MainLayout → Reportes
/configuracion      → ProtectedRoute → RoleRoute([admin]) → MainLayout → Configuracion
```

---

## 6. Estructura de archivos nueva/modificada

```
src/
├── services/
│   ├── api.js                  (nuevo)
│   ├── auth.service.js         (nuevo)
│   ├── rutas.service.js        (nuevo)
│   ├── sujetos.service.js      (nuevo)
│   └── encuestas.service.js    (nuevo)
├── pages/
│   ├── Login.jsx               (nuevo)
│   ├── Inicio.jsx              (modificar)
│   ├── Rutas.jsx               (modificar)
│   ├── NuevaEncuesta.jsx       (modificar)
│   ├── Reportes.jsx            (nuevo stub)
│   └── Configuracion.jsx       (nuevo stub)
├── components/
│   └── ProtectedRoute.jsx      (modificar — agregar spinner en isLoading)
├── context/
│   └── AuthContext.jsx         (ya corregido)
└── App.jsx                     (modificar — agregar rutas nuevas + RoleRoute)
```
