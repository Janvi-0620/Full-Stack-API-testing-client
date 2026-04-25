import { useState } from 'react';
import { MethodSelector } from './MethodSelector.jsx';
import { URLInput } from './URLInput.jsx';
import { HeadersTab } from './HeadersTab.jsx';
import { ParamsTab } from './ParamsTab.jsx';
import { BodyTab } from './BodyTab.jsx';

const TABS = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
];

export function RequestBuilder({ draft, onChange, onSend, onSave, sending, readOnly, canSave }) {
  const [tab, setTab] = useState('params');

  function patch(p) {
    onChange({ ...draft, ...p });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 16,
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <MethodSelector value={draft.method} disabled={readOnly} onChange={(m) => patch({ method: m })} />
        <URLInput value={draft.url} disabled={readOnly} onChange={(u) => patch({ url: u })} onSend={onSend} />
        <button type="button" className="btn btn-primary" disabled={readOnly || sending} onClick={onSend}>
          {sending ? 'Sending…' : 'Send'}
        </button>
        {canSave && (
          <button type="button" className="btn" disabled={readOnly} onClick={onSave}>
            Save
          </button>
        )}
      </div>
      <input
        className="input"
        placeholder="Request name"
        value={draft.name || ''}
        disabled={readOnly}
        onChange={(e) => patch({ name: e.target.value })}
      />
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
      <div className="scroll-y" style={{ flex: 1, minHeight: 200 }}>
        {tab === 'params' && (
          <ParamsTab items={draft.params || []} disabled={readOnly} onChange={(p) => patch({ params: p })} />
        )}
        {tab === 'headers' && (
          <HeadersTab items={draft.headers || []} disabled={readOnly} onChange={(h) => patch({ headers: h })} />
        )}
        {tab === 'body' && (
          <BodyTab body={draft.body || { type: 'none' }} disabled={readOnly} onChange={(b) => patch({ body: b })} />
        )}
      </div>
    </div>
  );
}
