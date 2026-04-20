import React from 'react';

export default function Badge({ children, variant = "neutral" }) {
  const styles = {
    neutral: "bg-surface dark:bg-slate-800 text-on-surface-variant dark:text-slate-300",
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    primary: "bg-primary/10 text-primary dark:bg-primary/20",
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles[variant]}`}>
      {children}
    </span>
  );
}