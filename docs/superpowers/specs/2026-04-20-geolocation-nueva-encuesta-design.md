# Geolocalización obligatoria en NuevaEncuesta

**Fecha:** 2026-04-20  
**Archivo afectado:** `src/pages/NuevaEncuesta.jsx`

## Objetivo

Incluir las coordenadas GPS del encuestador en cada envío de encuesta (online y offline). La geolocalización es obligatoria: no se puede enviar sin ella.

## Estado y captura

Se agregan dos estados al componente:

- `geoCoords` — `null` | `{ lat: number, lng: number }`
- `geoStatus` — `'pending' | 'granted' | 'denied' | 'error'`

Al montar el componente (`useEffect` con `[]`) se llama:

```js
navigator.geolocation.getCurrentPosition(
  (pos) => {
    setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setGeoStatus('granted');
  },
  () => setGeoStatus('denied'),
  { enableHighAccuracy: true, timeout: 10000 }
);
```

`enableHighAccuracy: true` fuerza GPS real en dispositivos móviles. `timeout: 10000` evita esperas indefinidas; si expira, el callback de error llama `setGeoStatus('error')`.

## Indicador de estado en la UI

Se renderiza un chip de estado inmediatamente debajo del `<header>`, antes del formulario:

| `geoStatus`        | Ícono                  | Texto                                                                 | Color  |
|--------------------|------------------------|-----------------------------------------------------------------------|--------|
| `pending`          | `sync` (animado)       | "Obteniendo ubicación..."                                             | Azul   |
| `granted`          | `check_circle`         | "Ubicación lista"                                                     | Verde  |
| `denied` / `error` | `location_off`         | "Permiso de ubicación denegado. Actívalo en los ajustes del dispositivo." | Rojo   |

## Bloqueo del envío

En `handleSubmit`, antes de cualquier otra validación:

```js
if (geoStatus !== 'granted') {
  MySwal.fire({
    icon: 'warning',
    title: 'Ubicación requerida',
    text: 'Activa el permiso de ubicación para continuar.',
    confirmButtonColor: '#3b82f6',
  });
  return;
}
```

El botón "Guardar Encuesta" también se deshabilita (`disabled`) mientras `geoStatus === 'pending'`.

## Inclusión en el envío online

```js
fd.append('latitud', geoCoords.lat);
fd.append('longitud', geoCoords.lng);
```

Se agregan al `FormData` junto con los campos existentes (`id_sujeto`, `id_tipo_documento`, `id_acta`, `evidencias`).

## Inclusión en el guardado offline (IndexedDB)

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

## Alcance

- Solo se modifica `src/pages/NuevaEncuesta.jsx`.
- No se toca `encuestasService`, `idb.service`, ni ningún otro archivo.
- No se agrega lógica de reintento automático de geolocalización (el usuario debe activar el permiso manualmente desde los ajustes del dispositivo).
