import React from 'react';

export default function ActionButton({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled,
  className = "" // Permite añadir clases extras desde el padre
}) {
  const base = "px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2";
  
  // Usamos nuestras variables semánticas configuradas en tailwind.config.js
  const styles = {
    primary: "bg-primary text-white shadow-sm hover:opacity-90",
    danger: "bg-red-500 text-white shadow-sm hover:bg-red-600",
    outline: "bg-surface-container dark:bg-surface-container-dark text-on-surface dark:text-white border border-surface-container-highest dark:border-slate-800 hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-primary hover:bg-primary/10" // Perfecto para botones de texto
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}