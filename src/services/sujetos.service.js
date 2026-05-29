import { apiFetch } from './api.js';

export const sujetosService = {
  searchSujetos: (query) =>
    apiFetch(`/sujetos?q=${encodeURIComponent(query)}`),
};
