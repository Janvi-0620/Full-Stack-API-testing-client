export function ResponseMeta({ status, time, error }) {
  if (error) {
    return (
      <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>
        {error}
      </div>
    );
  }
  if (status == null && time == null) return null;
  const color =
    status >= 200 && status < 300 ? 'var(--success)' : status >= 400 ? 'var(--danger)' : 'var(--warn)';
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 700, color }}>Status {status ?? '—'}</span>
      <span style={{ color: 'var(--muted)' }}>{time != null ? `${time} ms` : ''}</span>
    </div>
  );
}
