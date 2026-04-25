const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export function MethodSelector({ value, onChange, disabled }) {
  return (
    <select
      className="input"
      style={{ width: 'auto', minWidth: '7rem', fontWeight: 600 }}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {METHODS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
