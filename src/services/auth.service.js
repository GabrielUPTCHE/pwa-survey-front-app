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
