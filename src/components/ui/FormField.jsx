import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";

export const FormField = forwardRef(({ 
  label, 
  type = "text", 
  helper, 
  error, 
  className = "", 
  ...props // Captura el resto (value, onChange, disabled, placeholder, name, etc.)
}, ref) => {
  // Genera un ID único e irrepetible para este componente
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Etiqueta (Label) */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-semibold text-emerald-900/90"
        >
          {label}
        </label>
      )}

      {/* Contenedor relativo para poder posicionar iconos */}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-3 py-2.5 rounded-xl border bg-white text-sm text-on-surface
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-offset-1
            disabled:bg-emerald-50/50 disabled:text-emerald-900/40 disabled:cursor-not-allowed
            ${error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 pr-10" 
              : "border-outline-variant hover:border-primary/50 focus:border-primary focus:ring-primary/20"
            }
          `}
          {...props}
        />

        {/* Icono visual de error (UX/UI Best Practice) */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* Mensajes de feedback */}
      {error ? (
        <p id={errorId} className="text-red-500 text-xs font-medium mt-0.5 transition-all">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-emerald-600/70 text-xs mt-0.5 transition-all">
          {helper}
        </p>
      ) : null}
    </div>
  );
});

// Necesario cuando usas forwardRef para que React DevTools lo muestre correctamente
FormField.displayName = "FormField";