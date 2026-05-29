import { apiFetch } from './api.js';

export const rutasService = {
  getTurnosByFecha: (fecha) =>
    apiFetch(`/turnos?fecha=${fecha}`),
};
