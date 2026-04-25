import { useState } from 'react';
import { useEnvironment } from '../../context/EnvironmentContext.jsx';

export function EnvironmentSelector() {
  const {
    environments,
    activeId,
    selectEnvironment,
    createEnvironment,
    updateEnvironment,
    loading,
  } = useEnvironment();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [varsText, setVarsText] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await createEnvironment(name.trim(), []);
    setName('');
  }

  function openEdit(env) {
    setEditing(env._id);
    setVarsText(
      (env.variables || [])
        .map((v) => `${v.enabled === false ? '#' : ''}${v.key}=${v.value}`)
        .join('\n')
    );
  }

  async function saveVars(id) {
    const variables = [];
    for (const line of varsText.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      let enabled = true;
      let s = t;
      if (s.startsWith('#')) {
        enabled = false;
        s = s.slice(1).trim();
      }
      const eq = s.indexOf('=');
      const key = eq >= 0 ? s.slice(0, eq).trim() : s;
      const value = eq >= 0 ? s.slice(eq + 1) : '';
      if (key) variables.push({ key, value, enabled });
    }
    await updateEnvironment(id, { variables });
    setEditing(null);
  }

  return (
    <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Environment</div>
      {loading && <div style={{ fontSize: 13 }}>Loading…</div>}
      <select
        className="input"
        value={activeId || ''}
        onChange={(e) => selectEnvironment(e.target.value || null)}
        style={{ marginBottom: 8 }}
      >
        <option value="">— None —</option>
        {environments.map((env) => (
          <option key={env._id} value={env._id}>
            {env.name}
          </option>
        ))}
      </select>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input className="input" placeholder="New env name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn">
          Add
        </button>
      </form>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13 }}>
        {environments.map((env) => (
          <li key={env._id} style={{ marginBottom: 6 }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => openEdit(env)}>
              Edit vars: {env.name}
            </button>
          </li>
        ))}
      </ul>
      {editing && (
        <div style={{ marginTop: 8 }}>
          <textarea
            className="input mono"
            rows={6}
            value={varsText}
            onChange={(e) => setVarsText(e.target.value)}
            placeholder={'baseUrl=https://api.example.com\n#disabled=0'}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" className="btn btn-primary" onClick={() => saveVars(editing)}>
              Save variables
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
