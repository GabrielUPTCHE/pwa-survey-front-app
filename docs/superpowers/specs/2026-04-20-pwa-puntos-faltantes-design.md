# PWA Puntos Faltantes (1-4) — Design Spec

**Fecha:** 2026-04-20

## Objetivo

Cubrir tres gaps detectados en la auditoría PWA:
1. Estrategia `NetworkFirst` para rutas de datos críticos
2. Network Information API — indicador de tipo de red + advertencia en conexiones lentas
3. Campo `status` persistido en IndexedDB para encuestas pendientes

---

## 1. NetworkFirst para rutas críticas

### Archivos afectados
- `vite.config.js`

### Diseño

Agregar dos entradas al array `runtimeCaching` en la configuración Workbox, **antes** de la regla `StaleWhileRevalidate` existente para `/api/*`. Workbox evalúa reglas en orden y usa la primera coincidencia.

```js
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api/tipos-documento'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-critical-cache',
    networkTimeoutSeconds: 5,
    expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
    cacheableResponse: { statuses: [0, 200] },
  },
},
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api/sujetos'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-critical-cache',
    networkTimeoutSeconds: 5,
    expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
    cacheableResponse: { statuses: [0, 200] },
  },
},
```

**Comportamiento:** Siempre intenta la red primero. Si la red no responde en 5 segundos o falla, sirve desde caché. Si no hay caché, el error se propaga normalmente.

---

## 2. Network Information API

### Archivos afectados
- `src/layouts/MainLayout.jsx` — leer y exponer `effectiveType`
- `src/pages/NuevaEncuesta.jsx` — advertir antes de adjuntar archivos en conexión lenta

### Diseño — MainLayout.jsx

Agregar estado `connectionType` inicializado desde `navigator.connection?.effectiveType ?? null`. Suscribir al evento `change` de `navigator.connection` para actualizarlo en tiempo real. Limpiar el listener al desmontar.

Tipos posibles: `'slow-2g'`, `'2g'`, `'3g'`, `'4g'` (o `null` si el browser no soporta la API).

Mostrar un badge compacto junto al indicador online/offline existente en el header:

| `effectiveType` | Texto mostrado | Color |
|---|---|---|
| `'4g'` | `4G` | Verde (`text-emerald-500`) |
| `'3g'` | `3G` | Amarillo (`text-yellow-500`) |
| `'2g'` | `2G` | Naranja (`text-orange-500`) |
| `'slow-2g'` | `Lento` | Rojo (`text-rose-500`) |
| `null` / no soportado | (no se renderiza) | — |

El badge solo se muestra si `isOnline` es `true` (sin conexión no tiene sentido mostrar el tipo).

### Diseño — NuevaEncuesta.jsx

Leer `navigator.connection?.effectiveType` directamente en el handler del click de upload (no como estado — es una lectura puntual). Si es `'slow-2g'` o `'2g'`, mostrar confirmación antes de abrir el selector de archivos:

```js
const handleUploadClick = async () => {
  const type = navigator.connection?.effectiveType;
  if (type === 'slow-2g' || type === '2g') {
    const result = await MySwal.fire({
      icon: 'warning',
      title: 'Conexión lenta detectada',
      text: 'Subir archivos puede fallar o tardar mucho. ¿Continuar de todos modos?',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
    });
    if (!result.isConfirmed) return;
  }
  fileInputRef.current.click();
};
```

La zona de upload existente llama `fileInputRef.current.click()` directamente — se reemplaza por `handleUploadClick`.

---

## 3. Campo `status` en IndexedDB

### Archivos afectados
- `src/services/idb.service.js` — agregar `status: 'pending'` al guardar + nueva función `updateEncuestaStatus`
- `src/pages/Inicio.jsx` — usar `updateEncuestaStatus` en el loop de sync

### Diseño — idb.service.js

**`saveEncuestaOffline`:** Agregar `status: 'pending'` al objeto antes de hacer `store.add(data)`:

```js
export async function saveEncuestaOffline(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ ...data, status: 'pending' });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
```

**Nueva función `updateEncuestaStatus(id, status)`:**

```js
export async function updateEncuestaStatus(id, status) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (!record) { resolve(); return; }
      const putReq = store.put({ ...record, status });
      putReq.onsuccess = () => resolve();
      putReq.onerror = (e) => reject(e.target.error);
    };
    getReq.onerror = (e) => reject(e.target.error);
  });
}
```

### Diseño — Inicio.jsx

Importar `updateEncuestaStatus` desde `idb.service.js`. En el loop de sync:

```js
try {
  // ... preparar y enviar FormData ...
  await encuestasService.crearDocumento(fd);
  await updateEncuestaStatus(encuesta.id, 'synced');
  await deletePendingEncuesta(encuesta.id);
  success++;
} catch (_) {
  await updateEncuestaStatus(encuesta.id, 'error');
  failed++;
}
```

---

## Alcance

- No se agrega UI por encuesta (sin lista de estados individuales).
- No se modifica el esquema IDB (la clave primaria y el store name quedan igual).
- No se toca `encuestasService` ni `api.js`.
