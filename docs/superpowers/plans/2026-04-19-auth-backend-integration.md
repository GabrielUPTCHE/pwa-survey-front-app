# Auth + Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar todas las pantallas al backend real, agregar login con JWT cookie, protección de rutas por rol, y dejar rutas stub extensibles para Reportes y Configuración.

**Architecture:** Capa de servicios en `src/services/` centraliza todos los fetch (con credentials, manejo de errores en español, detección offline). Las páginas consumen servicios directamente en sus `useEffect`. AuthContext maneja el estado global de sesión.

**Tech Stack:** React 19, React Router 7, Vite 7, Tailwind CSS 3, IndexedDB nativo, JWT via httpOnly cookie.

---

## File Map

| Archivo | Estado | Responsabilidad |
|---------|--------|-----------------|
| `src/services/api.js` | Crear | Base fetch con credentials, errores, offline |
| `src/services/idb.service.js` | Crear | IndexedDB CRUD (extraído + extendido de NuevaEncuesta) |
| `src/services/auth.service.js` | Crear | login/logout/verify |
| `src/services/rutas.service.js` | Crear | getTurnosByFecha |
| `src/services/sujetos.service.js` | Crear | searchSujetos |
| `src/services/encuestas.service.js` | Crear | getTiposDocumento, crearDocumento |
| `src/components/ProtectedRoute.jsx` | Modificar | Spinner real mientras isLoading |
| `src/components/RoleRoute.jsx` | Modificar | Usar user.id_roles, mostrar "Sin acceso" en lugar de redirect |
| `src/pages/Login.jsx` | Crear | Pantalla de login standalone |
| `src/pages/Reportes.jsx` | Crear | Stub "Próximamente" |
| `src/pages/Configuracion.jsx` | Crear | Stub "Próximamente" |
| `src/pages/Inicio.jsx` | Modificar | Datos reales, pendientes offline, sync |
| `src/pages/Rutas.jsx` | Modificar | Datos reales, calendario navegable |
| `src/pages/NuevaEncuesta.jsx` | Modificar | Sujeto search, tipo documento, idb.service |
| `src/App.jsx` | Modificar | Todas las rutas + ProtectedRoute + RoleRoute |

---

## Task 1: Capa base de fetch (`src/services/api.js`)

**Files:**
- Create: `src/services/api.js`

- [ ] **Crear `src/services/api.js`**

```js
const BASE_URL = import.meta.env.VITE_PATH;

export async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    if (!res.ok) {
      let message = `Error ${res.status}`;
      try {
        const err = await res.json();
        message = err.message || err.error || message;
      } catch (_) {}
      throw new Error(message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Sin conexión. Verifica tu red.');
    }
    throw error;
  }
}
```

- [ ] **Commit**
```bash
git add src/services/api.js
git commit -m "feat: add base apiFetch service"
```

---

## Task 2: Servicio IndexedDB (`src/services/idb.service.js`)

**Files:**
- Create: `src/services/idb.service.js`
- Modify: `src/pages/NuevaEncuesta.jsx` (eliminar la función `saveEncuestaOffline` inline y usar el servicio)

- [ ] **Crear `src/services/idb.service.js`**

```js
const DB_NAME = 'CensoDB';
const STORE_NAME = 'encuestas_pendientes';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveEncuestaOffline(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(data);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getPendingEncuestas() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deletePendingEncuesta(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function countPendingEncuestas() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.count();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}
```

- [ ] **Commit**
```bash
git add src/services/idb.service.js
git commit -m "feat: add IndexedDB service with CRUD operations"
```

---

## Task 3: Servicios de dominio

**Files:**
- Create: `src/services/auth.service.js`
- Create: `src/services/rutas.service.js`
- Create: `src/services/sujetos.service.js`
- Create: `src/services/encuestas.service.js`

- [ ] **Crear `src/services/auth.service.js`**

```js
import { apiFetch } from './api.js';

export const authService = {
  login: ({ numero_identificacion, contraseña }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ numero_identificacion, contraseña }),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  verify: () =>
    apiFetch('/auth/verify'),
};
```

- [ ] **Crear `src/services/rutas.service.js`**

```js
import { apiFetch } from './api.js';

export const rutasService = {
  getTurnosByFecha: (fecha) =>
    apiFetch(`/turnos?fecha=${fecha}`),
};
```

- [ ] **Crear `src/services/sujetos.service.js`**

```js
import { apiFetch } from './api.js';

export const sujetosService = {
  searchSujetos: (query) =>
    apiFetch(`/sujetos?q=${encodeURIComponent(query)}`),
};
```

- [ ] **Crear `src/services/encuestas.service.js`**

```js
import { apiFetch } from './api.js';

export const encuestasService = {
  getTiposDocumento: () =>
    apiFetch('/tipos-documento'),

  crearDocumento: (formData) =>
    apiFetch('/documentos-legales', {
      method: 'POST',
      body: formData,
    }),
};
```

- [ ] **Commit**
```bash
git add src/services/auth.service.js src/services/rutas.service.js src/services/sujetos.service.js src/services/encuestas.service.js
git commit -m "feat: add domain service layer (auth, rutas, sujetos, encuestas)"
```

---

## Task 4: Actualizar guards de ruta

**Files:**
- Modify: `src/components/ProtectedRoute.jsx`
- Modify: `src/components/RoleRoute.jsx`

- [ ] **Reemplazar `src/components/ProtectedRoute.jsx`**

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant dark:text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

- [ ] **Reemplazar `src/components/RoleRoute.jsx`**

```jsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant dark:text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="text-sm font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.id_roles)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-rose-400">lock</span>
          <h2 className="text-xl font-bold text-on-surface dark:text-white">Sin acceso</h2>
          <p className="text-sm text-on-surface-variant dark:text-slate-400">
            Tu rol no tiene permisos para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
```

- [ ] **Commit**
```bash
git add src/components/ProtectedRoute.jsx src/components/RoleRoute.jsx
git commit -m "feat: improve route guards with spinner and sin-acceso screen"
```

---

## Task 5: Pantalla de Login (`src/pages/Login.jsx`)

**Files:**
- Create: `src/pages/Login.jsx`

- [ ] **Crear `src/pages/Login.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service.js';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ numero_identificacion: '', contraseña: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await authService.login(form);
      login(userData);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-surface-dark px-6 font-display">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-4xl">analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white tracking-tight">Censo 2024</h1>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-1">Ingresa con tu número de identificación</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">
              Número de Identificación
            </label>
            <input
              name="numero_identificacion"
              value={form.numero_identificacion}
              onChange={handleChange}
              required
              autoComplete="username"
              inputMode="numeric"
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Ej: 1234567890"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">
              Contraseña
            </label>
            <input
              name="contraseña"
              value={form.contraseña}
              onChange={handleChange}
              required
              type="password"
              autoComplete="current-password"
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500 text-lg shrink-0">error</span>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined">login</span>
            )}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Commit**
```bash
git add src/pages/Login.jsx
git commit -m "feat: add Login screen with JWT cookie auth"
```

---

## Task 6: Stubs Reportes y Configuración

**Files:**
- Create: `src/pages/Reportes.jsx`
- Create: `src/pages/Configuracion.jsx`

- [ ] **Crear `src/pages/Reportes.jsx`**

```jsx
export default function Reportes() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <span className="material-symbols-outlined text-6xl text-primary/40">bar_chart</span>
      <h2 className="text-xl font-bold text-on-surface dark:text-white">Reportes</h2>
      <p className="text-sm text-on-surface-variant dark:text-slate-400 max-w-xs">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}
```

- [ ] **Crear `src/pages/Configuracion.jsx`**

```jsx
export default function Configuracion() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <span className="material-symbols-outlined text-6xl text-primary/40">settings</span>
      <h2 className="text-xl font-bold text-on-surface dark:text-white">Configuración</h2>
      <p className="text-sm text-on-surface-variant dark:text-slate-400 max-w-xs">
        Esta sección estará disponible próximamente.
      </p>
    </div>
  );
}
```

- [ ] **Commit**
```bash
git add src/pages/Reportes.jsx src/pages/Configuracion.jsx
git commit -m "feat: add Reportes and Configuracion stub screens"
```

---

## Task 7: Actualizar `src/App.jsx` con todas las rutas

**Files:**
- Modify: `src/App.jsx`

- [ ] **Reemplazar `src/App.jsx`**

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import HomePage from './pages/Inicio';
import NuevaEncuesta from './pages/NuevaEncuesta';
import Rutas from './pages/Rutas';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/calendario" element={<Rutas />} />

              <Route element={<RoleRoute allowedRoles={['supervisor', 'admin']} />}>
                <Route path="/reportes" element={<Reportes />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/configuracion" element={<Configuracion />} />
              </Route>
            </Route>

            <Route path="/nueva-encuesta" element={<NuevaEncuesta />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
```

- [ ] **Commit**
```bash
git add src/App.jsx
git commit -m "feat: wire all routes with ProtectedRoute and RoleRoute"
```

---

## Task 8: Actualizar `src/pages/Inicio.jsx`

**Files:**
- Modify: `src/pages/Inicio.jsx`

- [ ] **Reemplazar `src/pages/Inicio.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingEncuestas, deletePendingEncuesta, countPendingEncuestas } from '../services/idb.service.js';
import { encuestasService } from '../services/encuestas.service.js';
import { apiFetch } from '../services/api.js';
import Badge from '../components/ui/Badge';
import ActionButton from '../components/ui/ActionButton';
import Swal from 'sweetalert2';

export default function Inicio() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [recientes, setRecientes] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const loadPendingCount = useCallback(async () => {
    try {
      const count = await countPendingEncuestas();
      setPendingCount(count);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadPendingCount();

    apiFetch('/rutas-visitas/recientes')
      .then(setRecientes)
      .catch(() => setRecientes([]));
  }, [loadPendingCount]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const pending = await getPendingEncuestas();
      if (pending.length === 0) {
        Swal.fire({ icon: 'info', title: 'Sin pendientes', text: 'No hay encuestas pendientes de sincronizar.', confirmButtonColor: '#3b82f6' });
        return;
      }

      let success = 0;
      let failed = 0;

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
          await deletePendingEncuesta(encuesta.id);
          success++;
        } catch (_) {
          failed++;
        }
      }

      await loadPendingCount();
      Swal.fire({
        icon: failed === 0 ? 'success' : 'warning',
        title: 'Sincronización completa',
        text: `${success} enviada(s) correctamente${failed > 0 ? `, ${failed} fallaron (sin conexión aún).` : '.'}`,
        confirmButtonColor: '#3b82f6',
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#ef4444' });
    } finally {
      setSyncing(false);
    }
  };

  const estadoColor = (estado) => {
    if (estado === 'Completado') return 'success';
    if (estado === 'En Progreso') return 'primary';
    if (estado === 'Pendiente') return 'warning';
    return 'neutral';
  };

  const initialsOf = (nombre = '', apellido = '') =>
    `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return (
    <>
      {/* Perfil */}
      <section className="p-4 mt-2">
        <div className="bg-surface-container dark:bg-surface-container-dark rounded-xl p-5 shadow-sm border border-surface-container-highest dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary/10 rounded-full p-1 border-2 border-primary">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initialsOf(user?.nombre, user?.apellido)}
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 border-2 border-surface-container dark:border-surface-container-dark rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">{pendingCount}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-on-surface-variant dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">Bienvenido de nuevo</p>
              <p className="text-on-surface dark:text-white text-xl font-bold leading-tight">
                {user ? `${user.nombre} ${user.apellido}` : '—'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="neutral">ID: {user?.numero_identificacion ?? '—'}</Badge>
                <Badge variant="primary">{user?.nombre_rol ?? '—'}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-surface-container-highest dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {pendingCount > 0 ? (
                <>
                  <span className="material-symbols-outlined text-amber-500 text-sm">cloud_off</span>
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">{pendingCount} encuesta(s) pendiente(s)</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-emerald-500 text-sm">cloud_done</span>
                  <p className="text-on-surface-variant dark:text-slate-400 text-xs font-medium">Todo sincronizado</p>
                </>
              )}
            </div>
            <ActionButton variant="ghost" className="!px-2 !py-1 !text-xs" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </ActionButton>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <main className="px-4">
        <h2 className="text-on-surface dark:text-white text-lg font-bold mb-4 px-1">Módulos Principales</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col gap-4 bg-surface-container dark:bg-surface-container-dark p-5 rounded-xl border border-surface-container-highest dark:border-slate-800 shadow-sm hover:border-primary transition-colors text-left group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">assignment</span>
            </div>
            <div>
              <h3 className="text-on-surface dark:text-white font-bold text-sm leading-snug">Mis Encuestas</h3>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs mt-1">Borradores y completadas</p>
            </div>
          </button>
          <button className="flex flex-col gap-4 bg-surface-container dark:bg-surface-container-dark p-5 rounded-xl border border-surface-container-highest dark:border-slate-800 shadow-sm hover:border-primary transition-colors text-left group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">map</span>
            </div>
            <div>
              <h3 className="text-on-surface dark:text-white font-bold text-sm leading-snug">Zonas Asignadas</h3>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs mt-1">Ver mapa de trabajo</p>
            </div>
          </button>
        </div>

        {/* Actividad reciente */}
        <div className="mt-8 bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider">Actividad Reciente</h4>
          </div>
          <div className="space-y-3">
            {recientes.length === 0 ? (
              <p className="text-xs text-on-surface-variant dark:text-slate-500 text-center py-4">Sin actividad reciente</p>
            ) : (
              recientes.slice(0, 5).map((visita) => (
                <div key={visita.id_rutas} className="flex items-center gap-3 bg-surface-container/50 dark:bg-surface-container-dark/50 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface dark:text-white">{visita.sujeto?.razon_social ?? 'Visita'}</p>
                    <p className="text-[10px] text-on-surface-variant dark:text-slate-400">{visita.fecha_programada}</p>
                  </div>
                  <Badge variant={estadoColor(visita.estado)}>{visita.estado?.toUpperCase()}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Commit**
```bash
git add src/pages/Inicio.jsx
git commit -m "feat: connect Inicio to real user data and offline sync"
```

---

## Task 9: Actualizar `src/pages/Rutas.jsx`

**Files:**
- Modify: `src/pages/Rutas.jsx`

- [ ] **Reemplazar `src/pages/Rutas.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { rutasService } from '../services/rutas.service.js';

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

const estadoStyle = {
  'En Progreso': 'border-primary text-primary bg-primary/10',
  'Pendiente':   'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  'Completado':  'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  'Futuro':      'border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-800/30',
};

const borderStyle = {
  'En Progreso': 'border-primary',
  'Pendiente':   'border-amber-500',
  'Completado':  'border-emerald-500',
  'Futuro':      'border-slate-400',
};

export default function Rutas() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedId, setExpandedId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setExpandedId(null);
    rutasService.getTurnosByFecha(toDateStr(selectedDate))
      .then(setTurnos)
      .catch((err) => {
        setError(err.message);
        setTurnos([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDay = (day) => {
    setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  };

  const isSelected = (day) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewDate.getMonth() &&
    selectedDate.getFullYear() === viewDate.getFullYear();

  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === viewDate.getMonth() &&
    today.getFullYear() === viewDate.getFullYear();

  const allVisitas = turnos.flatMap((t) => (t.rutas_visitas ?? []).map((v) => ({ ...v, turno: t })));

  return (
    <div className="flex flex-col w-full">
      <header className="sticky top-0 z-10 bg-surface dark:bg-surface-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center justify-center">
        <h1 className="text-lg font-bold text-on-surface dark:text-white tracking-tight">Agenda de Rutas</h1>
      </header>

      <main className="px-4 py-2 space-y-6">

        {/* Calendario */}
        <section className="bg-surface-container dark:bg-surface-container-dark mt-4 shadow-sm border border-surface-container-highest dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <p className="text-sm font-bold text-on-surface dark:text-white">
              {MESES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {DIAS.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-on-surface-variant/50 dark:text-slate-500">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-8" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`h-8 w-full flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                    selected
                      ? 'bg-primary text-white font-bold'
                      : tod
                      ? 'border border-primary text-primary'
                      : 'text-on-surface dark:text-slate-300 hover:bg-surface-container-highest dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lista de visitas */}
        <section>
          <h3 className="text-on-surface dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
            {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            {!loading && (
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                {allVisitas.length} {allVisitas.length === 1 ? 'sitio' : 'sitios'}
              </span>
            )}
          </h3>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-surface-container dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500">wifi_off</span>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {!loading && !error && allVisitas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-50">
              <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">Sin visitas para esta fecha</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {allVisitas.map((visita) => (
                <div
                  key={visita.id_rutas}
                  className="flex flex-col bg-surface-container dark:bg-surface-container-dark rounded-xl shadow-sm border border-surface-container-highest dark:border-slate-800 overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => setExpandedId(expandedId === visita.id_rutas ? null : visita.id_rutas)}
                >
                  <div className={`p-4 flex justify-between items-start border-l-4 ${borderStyle[visita.estado] ?? 'border-slate-400'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">storefront</span>
                      </div>
                      <div>
                        <p className="text-on-surface dark:text-white text-sm font-bold leading-tight">{visita.sujeto?.razon_social}</p>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                          {visita.turno?.hora_inicio} – {visita.turno?.hora_fin} • {visita.sujeto?.barrio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${estadoStyle[visita.estado] ?? estadoStyle['Futuro']}`}>
                        {visita.estado}
                      </span>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expandedId === visita.id_rutas ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {expandedId === visita.id_rutas && (
                    <div className="px-4 pb-4 pt-2 bg-primary/5 dark:bg-slate-800/30 border-t border-surface-container-highest dark:border-slate-800">
                      <div className="space-y-3 mt-2">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">location_on</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Ubicación</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.direccion_fisica}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">corporate_fare</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">NIT</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.nit ?? '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">map</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Zona</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.zona} – {visita.sujeto?.barrio}</p>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-primary text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          Iniciar Inspección
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Commit**
```bash
git add src/pages/Rutas.jsx
git commit -m "feat: connect Rutas to backend with navigable calendar"
```

---

## Task 10: Actualizar `src/pages/NuevaEncuesta.jsx`

**Files:**
- Modify: `src/pages/NuevaEncuesta.jsx`

- [ ] **Reemplazar `src/pages/NuevaEncuesta.jsx`**

```jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { saveEncuestaOffline } from '../services/idb.service.js';
import { sujetosService } from '../services/sujetos.service.js';
import { encuestasService } from '../services/encuestas.service.js';

const MySwal = withReactContent(Swal);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NuevaEncuesta() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Sujeto search
  const [sujetoQuery, setSujetoQuery] = useState('');
  const [sujetoResults, setSujetoResults] = useState([]);
  const [selectedSujeto, setSelectedSujeto] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(sujetoQuery, 400);

  // Tipos de documento
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [idTipoDocumento, setIdTipoDocumento] = useState('');

  // Archivos
  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    encuestasService.getTiposDocumento()
      .then(setTiposDocumento)
      .catch(() => setTiposDocumento([]));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSujetoResults([]);
      return;
    }
    setSearchLoading(true);
    sujetosService.searchSujetos(debouncedQuery)
      .then(setSujetoResults)
      .catch(() => setSujetoResults([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  const selectSujeto = (sujeto) => {
    setSelectedSujeto(sujeto);
    setSujetoQuery(sujeto.razon_social);
    setSujetoResults([]);
  };

  const handleFileChange = (e) => {
    setArchivos((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSujeto) {
      MySwal.fire({ icon: 'warning', title: 'Selecciona un sujeto', text: 'Busca y selecciona el establecimiento antes de continuar.', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!idTipoDocumento) {
      MySwal.fire({ icon: 'warning', title: 'Selecciona el tipo de documento', confirmButtonColor: '#3b82f6' });
      return;
    }

    setLoading(true);
    const idActa = `ACTA-${Date.now()}`;

    const fd = new FormData();
    fd.append('id_sujeto', selectedSujeto.id_sujeto);
    fd.append('id_tipo_documento', idTipoDocumento);
    fd.append('id_acta', idActa);
    archivos.forEach((file) => fd.append('evidencias', file));

    try {
      await encuestasService.crearDocumento(fd);
      MySwal.fire({ icon: 'success', title: '¡Enviado!', text: 'La encuesta se guardó en el servidor.', confirmButtonColor: '#3b82f6' });
      resetForm();
    } catch (error) {
      if (!navigator.onLine || error instanceof TypeError) {
        try {
          await saveEncuestaOffline({
            id_sujeto: selectedSujeto.id_sujeto,
            id_tipo_documento: idTipoDocumento,
            id_acta: idActa,
            archivos,
            sujeto_nombre: selectedSujeto.razon_social,
            fechaGuardado: new Date().toISOString(),
          });
          MySwal.fire({ icon: 'info', title: 'Guardado Offline', text: 'Sin conexión. La encuesta está segura en tu dispositivo y se sincronizará luego.', confirmButtonColor: '#3b82f6' });
          resetForm();
        } catch (idbError) {
          MySwal.fire({ icon: 'error', title: 'Error de almacenamiento', text: 'No se pudo guardar la encuesta localmente.', confirmButtonColor: '#ef4444' });
        }
      } else {
        MySwal.fire({ icon: 'error', title: 'Error del servidor', text: error.message, confirmButtonColor: '#ef4444' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSujeto(null);
    setSujetoQuery('');
    setIdTipoDocumento('');
    setArchivos([]);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface dark:bg-surface-dark text-on-surface dark:text-white font-display">
      <header className="sticky top-0 z-10 bg-surface-container dark:bg-surface-container-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} type="button" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Nueva Encuesta</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6 mt-2">

          {/* Búsqueda de sujeto */}
          <section className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Establecimiento</label>
            <div className="relative">
              <input
                value={sujetoQuery}
                onChange={(e) => { setSujetoQuery(e.target.value); setSelectedSujeto(null); }}
                placeholder="Buscar por nombre, NIT o barrio..."
                className="w-full h-14 px-4 pr-10 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
              />
              {searchLoading && (
                <span className="material-symbols-outlined animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-primary">sync</span>
              )}
            </div>
            {sujetoResults.length > 0 && (
              <div className="border border-primary/20 rounded-xl overflow-hidden shadow-md">
                {sujetoResults.map((s) => (
                  <button
                    key={s.id_sujeto}
                    type="button"
                    onClick={() => selectSujeto(s)}
                    className="w-full text-left px-4 py-3 bg-surface-container dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-slate-700 border-b border-surface-container-highest dark:border-slate-700 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-semibold text-on-surface dark:text-white">{s.razon_social}</p>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">{s.direccion_fisica} · {s.barrio}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedSujeto && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{selectedSujeto.razon_social}</p>
              </div>
            )}
          </section>

          {/* Tipo de documento */}
          <section className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Tipo de Documento</label>
            <select
              value={idTipoDocumento}
              onChange={(e) => setIdTipoDocumento(e.target.value)}
              required
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Selecciona un tipo...</option>
              {tiposDocumento.map((t) => (
                <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                  {t.nombre_documento}
                </option>
              ))}
            </select>
          </section>

          {/* Archivos */}
          <section className="space-y-4">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Subir Evidencias</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-6 bg-primary/5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
              </div>
              <p className="font-medium text-on-surface dark:text-slate-100">Toca para agregar fotos o PDFs</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,.pdf" className="hidden" />
            </div>
            {archivos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Archivos Adjuntos ({archivos.length})</p>
                <div className="flex flex-col gap-2">
                  {archivos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">
                          {file.type.includes('image') ? 'image' : 'description'}
                        </span>
                        <span className="text-sm font-medium truncate w-48">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-rose-500 p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="pt-6">
            <button
              disabled={loading}
              type="submit"
              className={`w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? <span className="material-symbols-outlined animate-spin">sync</span>
                : <span className="material-symbols-outlined">cloud_upload</span>}
              {loading ? 'Guardando...' : 'Guardar Encuesta'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
```

- [ ] **Commit**
```bash
git add src/pages/NuevaEncuesta.jsx
git commit -m "feat: connect NuevaEncuesta with sujeto search and tipo-documento selector"
```

---

## Task 11: Verificación final

- [ ] **Arrancar el servidor de desarrollo**
```bash
npm run dev
```

- [ ] **Verificar flujo de auth**
  - Navegar a `http://localhost:5173` → debe redirigir a `/login`
  - Ingresar con credenciales válidas → debe redirigir a `/`
  - Refrescar la página → debe mantenerse en `/` (verify con cookie)
  - Navegar a `/reportes` con rol `encuestador` → debe mostrar "Sin acceso"

- [ ] **Verificar Inicio**
  - El perfil muestra nombre, apellido y rol del usuario autenticado
  - El badge de pendientes muestra 0 si no hay nada en IndexedDB

- [ ] **Verificar Rutas**
  - Cambiar el mes con los botones ← → funciona
  - Al tocar un día carga los turnos (o muestra "Sin visitas" si no hay datos)
  - Loading skeletons aparecen mientras carga

- [ ] **Verificar NuevaEncuesta**
  - Buscar un sujeto (mínimo 2 caracteres) muestra resultados
  - El selector de tipo de documento carga opciones del backend
  - Enviar offline guarda en IndexedDB y aparece el badge en Inicio

- [ ] **Verificar stubs**
  - `/reportes` y `/configuracion` cargan sin errores

- [ ] **Build final sin errores**
```bash
npm run build
```

- [ ] **Commit final**
```bash
git add -A
git commit -m "feat: complete auth + backend integration"
```
