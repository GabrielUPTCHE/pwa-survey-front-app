import { forwardRef, useId } from "react";

export const Switch = forwardRef(({ label, checked, onChange, disabled = false, className = "" }, ref) => {
  const id = useId();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? "bg-primary" : "bg-gray-200"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-emerald-900 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
          {label}
        </label>
      )}
    </div>
  );
});

Switch.displayName = "Switch";