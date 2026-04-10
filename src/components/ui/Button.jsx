import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  disabled, 
  className = "", 
  type = "button",
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-emerald-800 focus:ring-primary/50 shadow-sm",
    secondary: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 focus:ring-emerald-500/50",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 shadow-sm",
    ghost: "bg-transparent text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-500/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className={`mr-2 ${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";