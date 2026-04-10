/**
 * Reusable CRUD button for the Activos module.
 * Team usage example:
 * <CrudActionButton action="add" onClick={...}>Agregar</CrudActionButton>
 * <CrudActionButton action="edit" compact onClick={...}>Editar</CrudActionButton>
 * <CrudActionButton action="delete" compact onClick={...}>Eliminar</CrudActionButton>
 */
export default function CrudActionButton({
  action = "add",
  compact = false,
  className = "",
  label,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

  const size = compact ? "px-2 py-2 text-xs" : "px-4 py-2 text-sm";

  const variants = {
    add: "bg-green-700 text-white hover:bg-green-800",
    primary: "bg-green-700 text-white hover:bg-green-800",
    secondary: "bg-white text-green-700 border border-green-200 hover:bg-green-50",
    edit: "bg-green-600 text-white hover:bg-green-700",
    delete: "border border-green-300 bg-green-50 text-green-800 hover:bg-green-100",
  };

  return (
    <button className={`${base} ${size} ${variants[action] || variants.add} ${className}`} {...props}>
      {children ?? label}
    </button>
  );
}
