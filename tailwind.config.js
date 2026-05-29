/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Mantenemos soporte para modo oscuro nativo de Tailwind
  theme: {
    extend: {
      colors: {
        // --- COLORES PRINCIPALES (Basados en el Censo 2024) ---
        "primary": "#1c74e9",
        "primary-container": "#eff6ff", // Azul muy claro para fondos de botones inactivos/hover
        "on-primary-container": "#1e3a8a", // Azul oscuro para texto sobre fondos claros
        "secondary-container": "#dbeafe", 
        "on-secondary-container": "#1d4ed8",
        
        // --- SUPERFICIES Y FONDOS ---
        "surface": "#f6f7f8", // El fondo general claro original
        "on-surface": "#0f172a", // Texto principal oscuro
        "on-surface-variant": "#475569", // Texto secundario oscuro (descripciones)
        "surface-container-highest": "#e2e8f0", // Bordes o divisores
        "surface-container": "#ffffff", // Fondo de las tarjetas blancas
        
        // --- FONDOS MODO OSCURO (Nuevos para tu lógica) ---
        "surface-dark": "#111821", // El fondo oscuro original
        "surface-container-dark": "#1e293b", // Fondo de tarjetas en modo oscuro
        "outline-variant": "#cbd5e1", // Bordes suaves

        // --- VARIABLES DINÁMICAS (Para tu Theming) ---
        // Les he puesto un valor por defecto (fallback) por si no defines la variable CSS
        "theme-header": "var(--color-header, #ffffff)",
        "theme-header-dark": "var(--color-header-dark, #0f172a)",
        "theme-page": "var(--color-page, #f6f7f8)",
        "theme-page-dark": "var(--color-page-dark, #111821)",
      },
      fontFamily: {
        // Mezclamos tu tipografía del censo con tu estructura anterior
        "display": ["Public Sans", "sans-serif"],
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}