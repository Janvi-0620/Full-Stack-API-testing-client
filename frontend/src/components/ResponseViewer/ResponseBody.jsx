function tryFormatJson(data) {
  if (data == null) return '';
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
}

export function ResponseBody({ body, contentType }) {
  const isJson =
    typeof body === 'object' ||
    (typeof body === 'string' && (contentType || '').includes('application/json'));
  const text = isJson && typeof body !== 'string' ? JSON.stringify(body, null, 2) : tryFormatJson(body);
  return (
    <pre
      className="mono scroll-y"
      style={{
        margin: 0,
        padding: 12,
        background: 'var(--bg)',
        borderRadius: 8,
        maxHeight: '42vh',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text || '—'}
    </pre>
  );
}
