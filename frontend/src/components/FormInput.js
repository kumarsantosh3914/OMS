function FormInput({ label, error, id, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} className={error ? 'input-error' : ''} {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}

export default FormInput;
