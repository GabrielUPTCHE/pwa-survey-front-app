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
