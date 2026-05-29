import { forwardRef, useId } from "react";
import { Search } from "lucide-react";

export const SearchBar = forwardRef(({ 
  label, 
  placeholder = "Buscar activos, usuarios...", 
  value, 
  onChange, 
  className = "", 
  containerClassName = "",
  onSearch, // Callback opcional para cuando se presiona Enter o se hace clic en el icono
  disabled = false,
  ...props 
}, ref) => {
  const inputId = useId();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`} role="search">
      {/* Etiqueta opcional (Label) - Importante para Accesibilidad */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-semibold text-emerald-900/90"
        >
          {label}
        </label>
      )}

      {/* Contenedor relativo para el input y el icono */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label ? undefined : placeholder} // Si no hay label, usa placeholder para accesibilidad
          className={`
            w-full px-3 pl-10 py-2.5 rounded-xl border bg-white text-sm text-on-surface 
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-offset-1 disabled:bg-emerald-50/50 disabled:text-emerald-900/40 disabled:cursor-not-allowed
            border-outline-variant hover:border-primary/50 focus:border-primary focus:ring-primary/20
            ${className}
          `}
          {...props}
        />

        {/* Icono de Lupa posicionado a la izquierda */}
        <div 
          className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer"
          onClick={() => onSearch && onSearch(value)}
        >
          <Search className="h-5 w-5 text-emerald-600/70 transition-colors group-hover:text-primary" />
        </div>
      </div>
    </div>
  );
});

// Necesario cuando usas forwardRef
SearchBar.displayName = "SearchBar";