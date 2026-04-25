export function ResponseHeaders({ headers }) {
  const entries = headers && typeof headers === 'object' ? Object.entries(headers) : [];
  return (
    <div className="scroll-y" style={{ maxHeight: '36vh' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="mono" style={{ padding: '6px 8px', color: 'var(--accent)', verticalAlign: 'top' }}>
                {k}
              </td>
              <td className="mono" style={{ padding: '6px 8px', wordBreak: 'break-all' }}>
                {Array.isArray(v) ? v.join(', ') : String(v)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!entries.length && <p style={{ color: 'var(--muted)' }}>No headers</p>}
    </div>
  );
}
