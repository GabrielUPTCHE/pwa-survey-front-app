const BASE_URL = import.meta.env.VITE_PATH;

if (!BASE_URL) {
  throw new Error('[api] VITE_PATH is not defined. Check your .env file.');
}

export async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    if (!res.ok) {
      let message = `Error ${res.status}`;
      try {
        const err = await res.json();
        message = err.message || err.error || message;
      } catch (_) {}
      throw new Error(message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof TypeError && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    )) {
      throw new Error('Sin conexión. Verifica tu red.');
    }
    throw error;
  }
}
