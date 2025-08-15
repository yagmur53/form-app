export default function Select({ options, value, onChange, label, error }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`form-control ${error ? "invalid-select" : ""}`}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
