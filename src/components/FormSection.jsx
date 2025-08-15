export default function FormSection({ legend, children }) {
  return (
    <fieldset className="form-section">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}
