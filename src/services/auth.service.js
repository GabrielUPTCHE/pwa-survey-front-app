import { apiFetch } from './api.js';

export const authService = {
  login: ({ numero_identificacion, contraseña }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: numero_identificacion, password: contraseña }),
    }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  verify: () =>
    apiFetch('/auth/verify'),
};
