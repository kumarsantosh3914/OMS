function FormSelect({ label, error, id, children, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} className={error ? 'input-error' : ''} {...props}>
        {children}
      </select>
      {error && <small>{error}</small>}
    </label>
  );
}

export default FormSelect;
