import { forwardRef, useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

export const SelectField = forwardRef(({ 
  label, 
  options = [], 
  helper, 
  error, 
  className = "", 
  placeholder = "Seleccione una opción...",
  ...props 
}, ref) => {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-emerald-900/90">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-3 py-2.5 pr-10 rounded-xl border bg-white text-sm text-on-surface appearance-none
            transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-emerald-50/50 disabled:text-emerald-900/40 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-outline-variant hover:border-primary/50 focus:border-primary focus:ring-primary/20"}
          `}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {error ? <AlertCircle className="h-5 w-5 text-red-500" /> : <ChevronDown className="h-4 w-4 text-emerald-600/70" />}
        </div>
      </div>
      {error ? (
        <p id={errorId} className="text-red-500 text-xs font-medium mt-0.5">{error}</p>
      ) : helper ? (
        <p id={helperId} className="text-emerald-600/70 text-xs mt-0.5">{helper}</p>
      ) : null}
    </div>
  );
});

SelectField.displayName = "SelectField";