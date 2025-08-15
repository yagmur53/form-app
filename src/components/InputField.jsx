export default function InputField({
  id,
  label,
  type = "text",
  placeholder = "",
  required = true,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
