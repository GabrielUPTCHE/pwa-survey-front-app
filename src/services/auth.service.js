import { apiFetch } from './api.js';

export const authService = {
  login: ({ numero_identificacion, contraseña }) =>
    apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ numero_identificacion, contraseña }),
    }),

  logout: () =>
    apiFetch('/logout', { method: 'POST' }),

  verify: () =>
    apiFetch('/verify'),
};
