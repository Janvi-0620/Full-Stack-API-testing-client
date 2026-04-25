import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export function ShareView() {
  const { token } = useParams();
  const [collection, setCollection] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/collections/shared/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Not found');
        if (!cancelled) setCollection(data.collection);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'var(--danger)' }}>{err}</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
  if (!collection) return <p style={{ padding: 24, color: 'var(--muted)' }}>Loading…</p>;

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>{collection.name}</h1>
      <p style={{ color: 'var(--muted)' }}>Read-only shared collection</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {collection.folders?.map((f) => (
          <li key={f._id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{f.name}</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(f.requests || []).map((r) => (
                <li key={r._id} className="mono" style={{ fontSize: 14, padding: '4px 0' }}>
                  {r.method} {r.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to="/">Home</Link>
    </div>
  );
}
