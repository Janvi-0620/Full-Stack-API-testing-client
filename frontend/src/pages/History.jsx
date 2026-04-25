import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const qs = new URLSearchParams();
      if (status) qs.set('status', status);
      if (method) qs.set('method', method);
      const data = await api(`/api/history?${qs.toString()}`);
      setItems(data.history || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    await api(`/api/history/${id}`, { method: 'DELETE' });
    await load();
  }

  function replay(h) {
    navigate('/', { state: { replay: h } });
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>History</h1>
        <Link to="/">← Dashboard</Link>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, marginBottom: 16 }}>
        <input className="input" style={{ width: 120 }} placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
        <input className="input" style={{ width: 120 }} placeholder="Method" value={method} onChange={(e) => setMethod(e.target.value)} />
        <button type="button" className="btn" onClick={load}>
          Apply filters
        </button>
      </div>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((h) => (
          <li
            key={h._id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <strong>{h.request?.method}</strong>{' '}
                <span className="mono" style={{ fontSize: 13 }}>
                  {h.request?.url}
                </span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                {h.response?.status} · {h.response?.time}ms · {new Date(h.timestamp).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary" onClick={() => replay(h)}>
                Replay
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => remove(h._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && !items.length && <p style={{ color: 'var(--muted)' }}>No history yet. Send a request from the dashboard while logged in.</p>}
    </div>
  );
}
