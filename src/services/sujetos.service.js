import { apiFetch } from './api.js';

export const sujetosService = {
  searchSujetos: (query) =>
    apiFetch(`/sujetos?q=${encodeURIComponent(query)}`),

  // POST /sujetos — registra un local nuevo y devuelve el sujeto creado
  createSujeto: (data) =>
    apiFetch('/sujetos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
