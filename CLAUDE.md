# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server on port 5173 (proxies /api → localhost:3000)
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
```

No test or lint commands are configured (ESLint is installed but unconfigured).

## Environment

Requires `.env` at the project root:
```
VITE_PATH=http://localhost:3000/api
VITE_RECAPTCHA_V3_SITE_KEY=<key>
```

## Architecture

**Stack:** React 19 + Vite 7 + React Router 7 + Tailwind CSS 3 + Framer Motion + Socket.IO client

### Routing & Auth

- `src/App.jsx` — all route definitions
- `src/context/AuthContext.jsx` — global auth state; verifies session via `/auth/verify` on load; exposes `useAuth()` hook
- `src/components/ProtectedRoute.jsx` — redirects unauthenticated users to `/login`
- `src/components/RoleRoute.jsx` — checks `user.rol` / `user.IDRol` for RBAC

### Page Layout

`src/layouts/MainLayout.jsx` wraps most pages with a top header (logo, online/offline badge) and a bottom mobile-style navigation bar (5 tabs + floating "+" button). Supports dark mode and safe-area insets.

### Offline / PWA

- **Service Worker:** `vite-plugin-pwa` with `autoUpdate`. Config in `vite.config.js`.
- **Caching rules (Workbox):**
  - Google Fonts → `CacheFirst` (1 year)
  - `/api/.*` → `StaleWhileRevalidate` (24h TTL)
  - Static assets → precached
- **IndexedDB fallback:** `src/pages/NuevaEncuesta.jsx` stores survey submissions (including `File` objects) to IndexedDB (`CensoDB` / `encuestas_pendientes`) when offline. Workbox BackgroundSync is intentionally omitted here because it cannot handle multipart file uploads — sync is done manually.

### Styling

Tailwind utility classes throughout. Custom tokens live in `tailwind.config.js` (primary: `#1c74e9`) and CSS variables in `src/index.css` (`--color-header`, `--color-page`, etc.). Dark mode via `dark:` class on `<html>`. Font stack: Public Sans (display), Manrope (headings), Inter (body). Material Symbols Outlined loaded from CDN.

### UI Components

Generic primitives in `src/components/ui/` (Button, Card, Badge, Modal, Table, FormField, Spinner, etc.). Alerts use SweetAlert2. Dropdowns use React-Select.

### Key Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/Inicio.jsx` | Dashboard: profile, modules, recent activity |
| `/calendario` | `src/pages/Rutas.jsx` | Accordion list of scheduled surveys |
| `/nueva-encuesta` | `src/pages/NuevaEncuesta.jsx` | Survey form with file upload + offline IndexedDB |

Reportes and Configuración tabs are stubs (not yet implemented).
