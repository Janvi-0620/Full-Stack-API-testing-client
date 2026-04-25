export const emptyDraft = {
  _id: null,
  name: 'Untitled',
  method: 'GET',
  url: '',
  headers: [],
  params: [],
  body: { type: 'none', content: null },
};

function headersObjectToPairs(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([key, value]) => ({ key, value: String(value), enabled: true }));
}

export function requestToDraft(req) {
  if (!req) return { ...emptyDraft };
  const body = req.body || { type: 'none', content: null };
  let b = { ...body };
  if (body.type === 'json' && body.content != null && typeof body.content !== 'string') {
    b = { ...body, content: JSON.stringify(body.content, null, 2) };
  }
  return {
    _id: req._id,
    name: req.name || 'Untitled',
    method: req.method || 'GET',
    url: req.url || '',
    headers: Array.isArray(req.headers) ? req.headers : headersObjectToPairs(req.headers),
    params: Array.isArray(req.params) ? req.params : [],
    body: b,
  };
}

export function historyToDraft(h) {
  const q = h.request || {};
  const headers = Array.isArray(q.headers) ? q.headers : headersObjectToPairs(q.headers);
  const body = q.body && typeof q.body === 'object' && q.body.type ? q.body : { type: 'none', content: null };
  let b = body;
  if (body.type === 'json' && body.content != null && typeof body.content !== 'string') {
    b = { ...body, content: JSON.stringify(body.content, null, 2) };
  }
  return {
    ...emptyDraft,
    name: 'Replay',
    method: q.method || 'GET',
    url: q.url || '',
    headers,
    params: Array.isArray(q.params) ? q.params : [],
    body: b,
  };
}

export function draftToSavePayload(draft) {
  const body = { ...(draft.body || { type: 'none', content: null }) };
  if (body.type === 'json' && typeof body.content === 'string') {
    try {
      body.content = JSON.parse(body.content);
    } catch {
      /* keep string */
    }
  }
  return {
    name: draft.name,
    method: draft.method,
    url: draft.url,
    headers: draft.headers || [],
    params: draft.params || [],
    body,
  };
}
