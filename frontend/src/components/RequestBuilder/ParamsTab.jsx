export function ParamsTab({ items, onChange, disabled }) {
  const rows = items.length ? items : [{ key: '', value: '', enabled: true }];

  function setRow(i, patch) {
    const next = rows.map((r, j) => (j === i ? { ...r, ...patch } : r));
    const trimmed = next.filter((r) => r.key || r.value || r.enabled !== false);
    onChange(trimmed.length ? trimmed : [{ key: '', value: '', enabled: true }]);
  }

  function addRow() {
    onChange([...rows, { key: '', value: '', enabled: true }]);
  }

  function removeRow(i) {
    const next = rows.filter((_, j) => j !== i);
    onChange(next.length ? next : [{ key: '', value: '', enabled: true }]);
  }

  return (
    <div className="kv-grid">
      {rows.map((row, i) => (
        <div key={i} className="kv-row">
          <input
            className="input mono"
            placeholder="Query key"
            value={row.key}
            disabled={disabled}
            onChange={(e) => setRow(i, { key: e.target.value })}
          />
          <input
            className="input mono"
            placeholder="Value"
            value={row.value}
            disabled={disabled}
            onChange={(e) => setRow(i, { value: e.target.value })}
          />
          <label style={{ color: 'var(--muted)', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={row.enabled !== false}
              disabled={disabled}
              onChange={(e) => setRow(i, { enabled: e.target.checked })}
            />{' '}
            on
          </label>
          <button type="button" className="btn btn-ghost" disabled={disabled} onClick={() => removeRow(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" disabled={disabled} onClick={addRow}>
        Add parameter
      </button>
    </div>
  );
}
