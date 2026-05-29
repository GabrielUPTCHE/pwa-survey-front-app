# PWA Puntos Faltantes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cubrir tres gaps PWA: NetworkFirst para rutas críticas, indicador de tipo de red + advertencia en conexiones lentas, y campo `status` persistido en IndexedDB.

**Architecture:** Tres cambios independientes: (1) configuración Workbox en `vite.config.js`, (2) estado de red en `MainLayout.jsx` y advertencia en `NuevaEncuesta.jsx`, (3) campo `status` en `idb.service.js` y uso en `Inicio.jsx`.

**Tech Stack:** React 19, Vite 7, vite-plugin-pwa/Workbox, Network Information API (`navigator.connection`), IndexedDB nativo.

---

> **Nota:** Este proyecto no tiene suite de tests. Los pasos de verificación son manuales en dev server.

---

### Task 1: NetworkFirst para `/api/tipos-documento` y `/api/sujetos`

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Agregar dos reglas NetworkFirst antes de StaleWhileRevalidate**

En `vite.config.js`, dentro de `workbox.runtimeCaching`, insertar las dos entradas siguientes **antes** del objeto existente con `handler: 'StaleWhileRevalidate'` (actualmente en línea 72):

```js
// NetworkFirst para datos críticos: tipos-documento y sujetos
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api/tipos-documento'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-critical-cache',
    networkTimeoutSeconds: 5,
    expiration: {
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24,
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
  },
},
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api/sujetos'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-critical-cache',
    networkTimeoutSeconds: 5,
    expiration: {
      maxEntries: 20,
      maxAgeSeconds: 60 * 60 * 24,
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
  },
},
```

El resultado final del array `runtimeCaching` debe quedar en este orden:
1. CacheFirst Google Fonts (`fonts.googleapis.com`)
2. CacheFirst gstatic (`fonts.gstatic.com`)
3. **NetworkFirst `/api/tipos-documento`** ← nuevo
4. **NetworkFirst `/api/sujetos`** ← nuevo
5. StaleWhileRevalidate `/api/*` GET (ya existente)

- [ ] **Step 2: Verificar en dev server**

Ejecutar `npm run dev`. Abrir `http://localhost:5173/nueva-encuesta`.
- En DevTools → Application → Service Workers: verificar que el SW se registra sin errores.
- En DevTools → Network: navegar a `Nueva Encuesta`, confirmar que las llamadas a `/api/tipos-documento` y `/api/sujetos` muestran el encabezado de respuesta del SW (columna "Service Worker" en Network tab).

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "feat: add NetworkFirst strategy for tipos-documento and sujetos API routes"
```

---

### Task 2: Indicador de tipo de red en MainLayout

**Files:**
- Modify: `src/layouts/MainLayout.jsx`

- [ ] **Step 1: Agregar estado `connectionType`**

Después de la línea `const [isOnline, setIsOnline] = useState(navigator.onLine);` (línea 5), agregar:

```js
const [connectionType, setConnectionType] = useState(
  navigator.connection?.effectiveType ?? null
);
```

- [ ] **Step 2: Agregar listener de cambios de red**

Dentro del `useEffect` existente (el que agrega listeners `online`/`offline`), agregar el listener de `navigator.connection` al final del bloque. El `useEffect` completo debe quedar así:

```js
useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  const handleConnectionChange = () => {
    setConnectionType(navigator.connection?.effectiveType ?? null);
  };
  navigator.connection?.addEventListener('change', handleConnectionChange);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    navigator.connection?.removeEventListener('change', handleConnectionChange);
  };
}, []);
```

- [ ] **Step 3: Agregar función helper para el label del badge**

Después del `useEffect` y antes de `getNavLinkClass`, agregar:

```js
const getConnectionLabel = (type) => {
  if (type === '4g') return '4G';
  if (type === '3g') return '3G';
  if (type === '2g') return '2G';
  if (type === 'slow-2g') return 'Lento';
  return null;
};

const getConnectionColor = (type) => {
  if (type === '4g') return 'text-emerald-500';
  if (type === '3g') return 'text-yellow-500';
  if (type === '2g') return 'text-orange-500';
  if (type === 'slow-2g') return 'text-rose-500';
  return '';
};
```

- [ ] **Step 4: Renderizar badge de tipo de red en el header**

En el `<header>`, después del `<div>` del badge online/offline (que termina en `</div>` cerca de la línea 49), agregar el badge de tipo de red:

```jsx
{isOnline && getConnectionLabel(connectionType) && (
  <span className={`ml-2 text-xs font-bold ${getConnectionColor(connectionType)}`}>
    {getConnectionLabel(connectionType)}
  </span>
)}
```

El bloque del header con ambos badges debe quedar así:

```jsx
<div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
  isOnline 
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
}`}>
  <span className={`h-2 w-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
  <span className="text-xs font-bold uppercase tracking-wider">
    {isOnline ? 'En línea' : 'Sin conexión'}
  </span>
  {isOnline && getConnectionLabel(connectionType) && (
    <span className={`text-xs font-bold ${getConnectionColor(connectionType)}`}>
      · {getConnectionLabel(connectionType)}
    </span>
  )}
</div>
```

- [ ] **Step 5: Verificar en dev server**

Abrir `http://localhost:5173`. En el header debe aparecer "En línea · 4G" (o el tipo actual).
- En DevTools → Network → No throttling: cambiar a "Slow 3G" — el badge debe cambiar a "3G" o "Lento" (depende del browser).
- Si el browser no soporta `navigator.connection`, el badge simplemente no aparece (no hay error).

- [ ] **Step 6: Commit**

```bash
git add src/layouts/MainLayout.jsx
git commit -m "feat: add network connection type badge to MainLayout header"
```

---

### Task 3: Advertencia de conexión lenta en NuevaEncuesta

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Step 1: Extraer handler del click de upload**

En `NuevaEncuesta.jsx`, la zona de upload actual tiene `onClick={() => fileInputRef.current.click()}` en el `<div>` (línea ~197). Reemplazar por una función `handleUploadClick` que primero verifica la velocidad de red.

Agregar esta función después de `removeFile` y antes de `handleSubmit`:

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

- [ ] **Step 2: Actualizar el `onClick` del div de upload**

En el `<div>` de la zona de upload, cambiar:

```jsx
onClick={() => fileInputRef.current.click()}
```

a:

```jsx
onClick={handleUploadClick}
```

- [ ] **Step 3: Verificar en dev server**

En DevTools → Network → Throttling: seleccionar "Slow 3G".
- Tocar la zona de upload en `http://localhost:5173/nueva-encuesta`.
- Debe aparecer el SweetAlert de advertencia con botones "Sí, continuar" y "Cancelar".
- Al cancelar: no se abre el selector de archivos.
- Al confirmar: se abre el selector normalmente.
- Con throttling en "No throttling" (4G): no debe aparecer el alert.

- [ ] **Step 4: Commit**

```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: warn user before file upload on slow connections in NuevaEncuesta"
```

---

### Task 4: Campo `status` en IndexedDB + actualización en sync

**Files:**
- Modify: `src/services/idb.service.js`
- Modify: `src/pages/Inicio.jsx`

- [ ] **Step 1: Actualizar `saveEncuestaOffline` para incluir `status: 'pending'`**

En `src/services/idb.service.js`, en la función `saveEncuestaOffline`, cambiar la línea `const req = store.add(data);` para incluir el campo `status`:

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

- [ ] **Step 2: Agregar función `updateEncuestaStatus`**

Al final de `src/services/idb.service.js`, agregar:

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

- [ ] **Step 3: Importar `updateEncuestaStatus` en `Inicio.jsx`**

En `src/pages/Inicio.jsx`, línea 3, actualizar el import de `idb.service.js`:

```js
import { getPendingEncuestas, deletePendingEncuesta, countPendingEncuestas, updateEncuestaStatus } from '../services/idb.service.js';
```

- [ ] **Step 4: Usar `updateEncuestaStatus` en el loop de sync**

En `src/pages/Inicio.jsx`, en `handleSync`, reemplazar el bloque `for` completo:

```js
for (const encuesta of pending) {
  try {
    const fd = new FormData();
    fd.append('id_sujeto', encuesta.id_sujeto);
    fd.append('id_tipo_documento', encuesta.id_tipo_documento);
    fd.append('id_acta', encuesta.id_acta);
    if (encuesta.archivos) {
      encuesta.archivos.forEach((file) => fd.append('evidencias', file));
    }
    await encuestasService.crearDocumento(fd);
    await updateEncuestaStatus(encuesta.id, 'synced');
    await deletePendingEncuesta(encuesta.id);
    success++;
  } catch (_) {
    await updateEncuestaStatus(encuesta.id, 'error');
    failed++;
  }
}
```

- [ ] **Step 5: Verificar en dev server**

- Guardar una encuesta offline (desconectar en DevTools → Network → Offline).
- En DevTools → Application → IndexedDB → CensoDB → encuestas_pendientes: verificar que el registro tiene `status: "pending"`.
- Reconectar y tocar "Sincronizar ahora".
- Si la sync falla (backend apagado): el registro debe mostrar `status: "error"` en IDB.
- Si la sync funciona: el registro debe desaparecer de IDB (fue eliminado tras `status: "synced"`).

- [ ] **Step 6: Commit**

```bash
git add src/services/idb.service.js src/pages/Inicio.jsx
git commit -m "feat: persist status field in IndexedDB and update on sync (pending/synced/error)"
```
