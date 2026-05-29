# Geolocalización en NuevaEncuesta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capturar coordenadas GPS al montar NuevaEncuesta e incluirlas obligatoriamente en cada envío (online y offline).

**Architecture:** Se agregan dos estados (`geoCoords`, `geoStatus`) y un `useEffect` de captura al montar. Un chip de estado visual informa al usuario. El submit queda bloqueado si la ubicación no está lista; las coords se añaden al `FormData` y al objeto IndexedDB.

**Tech Stack:** React 19, Geolocation API (nativa del browser), SweetAlert2

---

> **Nota:** Este proyecto no tiene suite de tests configurada (`CLAUDE.md`). Los pasos de TDD se omiten; cada tarea incluye verificación manual en dev server.

---

### Task 1: Agregar estados y captura de geolocalización al montar

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Step 1: Agregar estados `geoCoords` y `geoStatus`**

En `src/pages/NuevaEncuesta.jsx`, después de la línea `const [archivos, setArchivos] = useState([]);` (línea 37), agregar:

```js
const [geoCoords, setGeoCoords] = useState(null);
const [geoStatus, setGeoStatus] = useState('pending');
```

- [ ] **Step 2: Agregar `useEffect` de captura al montar**

Después del `useEffect` de `tiposDocumento` (después de la línea 43), agregar:

```js
useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGeoStatus('granted');
    },
    () => setGeoStatus('denied'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}, []);
```

- [ ] **Step 3: Verificar en dev server**

Ejecutar `npm run dev` y abrir `http://localhost:5173/nueva-encuesta`.
- En DevTools → Console: no debe haber errores.
- En DevTools → Application → Permissions: debe aparecer la solicitud de ubicación al abrir la página.

- [ ] **Step 4: Commit**

```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: capture geolocation on mount in NuevaEncuesta"
```

---

### Task 2: Agregar chip de estado de geolocalización en la UI

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Step 1: Insertar chip entre `<header>` y `<main>`**

Dentro del `<main>`, antes del `<form>` (antes de `<form onSubmit={handleSubmit}`), agregar:

```jsx
{/* Geo status chip */}
<div className="max-w-md mx-auto px-4 pt-3">
  {geoStatus === 'pending' && (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <span className="material-symbols-outlined animate-spin text-blue-500 text-sm">sync</span>
      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Obteniendo ubicación...</p>
    </div>
  )}
  {geoStatus === 'granted' && (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
      <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Ubicación lista</p>
    </div>
  )}
  {(geoStatus === 'denied' || geoStatus === 'error') && (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
      <span className="material-symbols-outlined text-rose-500 text-sm">location_off</span>
      <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Permiso de ubicación denegado. Actívalo en los ajustes del dispositivo.</p>
    </div>
  )}
</div>
```

- [ ] **Step 2: Verificar en dev server**

Abrir `http://localhost:5173/nueva-encuesta`.
- Al cargar, debe aparecer el chip azul "Obteniendo ubicación..." brevemente.
- Al aceptar el permiso: chip verde "Ubicación lista".
- Al denegar el permiso (o bloquear en DevTools → Sensors): chip rojo con mensaje de permiso.

- [ ] **Step 3: Commit**

```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: add geolocation status chip to NuevaEncuesta"
```

---

### Task 3: Bloquear el submit cuando la ubicación no está lista

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Step 1: Agregar guard al inicio de `handleSubmit`**

Al inicio de `handleSubmit`, después de `e.preventDefault();` y antes del check de `selectedSujeto`, agregar:

```js
if (geoStatus !== 'granted') {
  MySwal.fire({
    icon: 'warning',
    title: 'Ubicación requerida',
    text: 'Activa el permiso de ubicación para poder enviar la encuesta.',
    confirmButtonColor: '#3b82f6',
  });
  return;
}
```

- [ ] **Step 2: Deshabilitar el botón mientras `geoStatus === 'pending'`**

En el botón de submit, cambiar la prop `disabled` de:

```jsx
disabled={loading}
```

a:

```jsx
disabled={loading || geoStatus === 'pending'}
```

Y actualizar el `className` condicional de:

```jsx
className={`... ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
```

a:

```jsx
className={`... ${(loading || geoStatus === 'pending') ? 'opacity-50 cursor-not-allowed' : ''}`}
```

- [ ] **Step 3: Verificar en dev server**

- Con permiso denegado: tocar "Guardar Encuesta" debe mostrar el SweetAlert de warning.
- Con `geoStatus === 'pending'` (simular bloqueando en DevTools): el botón debe aparecer deshabilitado.
- Con permiso concedido: el botón debe estar activo y no mostrar el warning.

- [ ] **Step 4: Commit**

```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: block survey submit when geolocation is not granted"
```

---

### Task 4: Incluir coordenadas en el envío online y offline

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Step 1: Agregar coordenadas al `FormData`**

Después de la línea `archivos.forEach((file) => fd.append('evidencias', file));`, agregar:

```js
fd.append('latitud', geoCoords.lat);
fd.append('longitud', geoCoords.lng);
```

- [ ] **Step 2: Agregar coordenadas al objeto IndexedDB**

En el objeto pasado a `saveEncuestaOffline`, agregar `latitud` y `longitud`:

```js
await saveEncuestaOffline({
  id_sujeto: selectedSujeto.id_sujeto,
  id_tipo_documento: idTipoDocumento,
  id_acta: idActa,
  archivos,
  sujeto_nombre: selectedSujeto.razon_social,
  fechaGuardado: new Date().toISOString(),
  latitud: geoCoords.lat,
  longitud: geoCoords.lng,
});
```

- [ ] **Step 3: Verificar envío online en dev server**

Con backend corriendo en `localhost:3000`:
- Completar el formulario con permiso de ubicación concedido.
- Enviar y verificar en DevTools → Network que el request POST a `/api/documentos-legales` incluye los campos `latitud` y `longitud` en el body multipart.

- [ ] **Step 4: Verificar guardado offline**

- En DevTools → Network: activar "Offline".
- Completar y enviar el formulario.
- Debe mostrar SweetAlert "Guardado Offline".
- En DevTools → Application → IndexedDB → CensoDB → encuestas_pendientes: verificar que el registro incluye `latitud` y `longitud`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: include geolocation coords in online and offline survey submission"
```
