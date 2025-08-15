export default function SelectField({
  id,
  label,
  options,
  required = true,
  onChange,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select id={id} required={required} onChange={onChange}>
        <option value="">Seçiniz</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
