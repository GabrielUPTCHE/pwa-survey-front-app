import { SelectField } from "./SelectField";

export default function FormSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccionar", 
  disabled = false,
  helper,
  error 
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />
      {helper && <p className="text-gray-500 text-xs mt-1">{helper}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
