export function BodyTab({ body, onChange, disabled }) {
  const type = body?.type || 'none';
  const content = body?.content;

  function setType(next) {
    if (next === 'none') onChange({ type: 'none', content: null });
    else if (next === 'json') onChange({ type: 'json', content: content ?? '{\n  \n}' });
    else if (next === 'raw') onChange({ type: 'raw', content: content ?? '' });
    else if (next === 'formdata') onChange({ type: 'formdata', content: content && typeof content === 'object' ? content : {} });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['none', 'json', 'formdata', 'raw'].map((t) => (
          <label key={t} style={{ cursor: disabled ? 'default' : 'pointer', color: 'var(--muted)' }}>
            <input
              type="radio"
              name="bodytype"
              checked={type === t}
              disabled={disabled}
              onChange={() => setType(t)}
            />{' '}
            {t}
          </label>
        ))}
      </div>
      {type === 'json' && (
        <textarea
          className="input mono scroll-y"
          rows={14}
          disabled={disabled}
          value={typeof content === 'string' ? content : JSON.stringify(content ?? {}, null, 2)}
          onChange={(e) => onChange({ type: 'json', content: e.target.value })}
        />
      )}
      {type === 'raw' && (
        <textarea
          className="input mono scroll-y"
          rows={10}
          disabled={disabled}
          value={typeof content === 'string' ? content : ''}
          onChange={(e) => onChange({ type: 'raw', content: e.target.value })}
        />
      )}
      {type === 'formdata' && (
        <FormKeyValues
          value={content && typeof content === 'object' ? content : {}}
          disabled={disabled}
          onChange={(obj) => onChange({ type: 'formdata', content: obj })}
        />
      )}
    </div>
  );
}

function FormKeyValues({ value, onChange, disabled }) {
  const entries = Object.keys(value).length ? Object.entries(value) : [['', '']];

  function update(i, k, v) {
    const next = [...entries];
    next[i] = [k, v];
    const obj = {};
    for (const [kk, vv] of next) {
      if (kk) obj[kk] = vv;
    }
    onChange(obj);
  }

  function add() {
    onChange({ ...value, '': '' });
  }

  function remove(i) {
    const next = entries.filter((_, j) => j !== i);
    const obj = {};
    for (const [kk, vv] of next) {
      if (kk) obj[kk] = vv;
    }
    onChange(Object.keys(obj).length ? obj : { '': '' });
  }

  return (
    <div className="kv-grid">
      {entries.map(([k, v], i) => (
        <div key={i} className="kv-row">
          <input
            className="input mono"
            placeholder="field"
            value={k}
            disabled={disabled}
            onChange={(e) => update(i, e.target.value, v)}
          />
          <input
            className="input mono"
            placeholder="value"
            value={v}
            disabled={disabled}
            onChange={(e) => update(i, k, e.target.value)}
          />
          <span />
          <button type="button" className="btn btn-ghost" disabled={disabled} onClick={() => remove(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost" disabled={disabled} onClick={add}>
        Add field
      </button>
    </div>
  );
}
