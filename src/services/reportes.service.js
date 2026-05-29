import { apiFetch } from './api.js';

export const reportesService = {
  // GET /reportes/diario?fecha=YYYY-MM-DD
  // → { total, completadas, faltan, puntos: [{ nombre, direccion, lat, lng, hora }] }
  getReporteDiario: (fecha) =>
    apiFetch(`/reportes/diario?fecha=${fecha}`),
};
