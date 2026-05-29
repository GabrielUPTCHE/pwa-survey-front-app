import { X } from "lucide-react";
import { useEffect } from "react";

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  // Previene el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-900/40 backdrop-blur-sm transition-opacity">
      <div 
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} overflow-hidden transform transition-all`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-emerald-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};