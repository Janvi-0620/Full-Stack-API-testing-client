import { useState } from 'react';
import { ResponseBody } from './ResponseBody.jsx';
import { ResponseHeaders } from './ResponseHeaders.jsx';
import { ResponseMeta } from './ResponseMeta.jsx';

const TABS = [
  { id: 'body', label: 'Body' },
  { id: 'headers', label: 'Headers' },
];

export function ResponseViewer({ response, error }) {
  const [tab, setTab] = useState('body');
  const ct = response?.headers?.['content-type'] || response?.headers?.['Content-Type'] || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        minHeight: 0,
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem' }}>Response</h3>
      <ResponseMeta status={response?.status} time={response?.time} error={error} />
      {!error && response && (
        <>
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="tab"
                data-active={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'body' && <ResponseBody body={response.body} contentType={ct} />}
          {tab === 'headers' && <ResponseHeaders headers={response.headers} />}
        </>
      )}
    </div>
  );
}
