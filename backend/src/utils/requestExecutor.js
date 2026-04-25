import axios from 'axios';

function buildUrlWithParams(url, params = []) {
  const enabled = (params || []).filter((p) => p && p.enabled !== false && p.key);
  let u;
  try {
    u = new URL(url);
  } catch {
    u = new URL(url, 'http://placeholder.local');
  }
  for (const p of enabled) {
    u.searchParams.append(p.key, p.value ?? '');
  }
  if (/^https?:\/\//i.test(url)) {
    return u.href;
  }
  return `${u.pathname}${u.search}`;
}

export async function executeHttpRequest({ method, url, headers = [], params = [], body }) {
  const start = Date.now();
  const finalUrl = buildUrlWithParams(url, params);
  const hdrs = {};
  for (const h of headers || []) {
    if (h && h.enabled !== false && h.key) hdrs[h.key] = h.value ?? '';
  }

  const m = (method || 'GET').toLowerCase();
  const axiosConfig = {
    method: m,
    url: finalUrl,
    headers: hdrs,
    maxRedirects: 5,
    validateStatus: () => true,
    timeout: 120000,
    responseType: 'text',
    transformResponse: [(r) => r],
  };

  const b = body || { type: 'none', content: null };
  if (!['get', 'head'].includes(m)) {
    if (b.type === 'json' && b.content != null) {
      const str = typeof b.content === 'string' ? b.content : JSON.stringify(b.content);
      axiosConfig.data = str;
      if (!hdrs['Content-Type'] && !hdrs['content-type']) {
        axiosConfig.headers['Content-Type'] = 'application/json';
      }
    } else if (b.type === 'raw' && b.content != null) {
      axiosConfig.data = typeof b.content === 'string' ? b.content : String(b.content);
    } else if (b.type === 'formdata' && b.content && typeof b.content === 'object') {
      const fd = new URLSearchParams();
      for (const [k, v] of Object.entries(b.content)) {
        fd.append(k, String(v));
      }
      axiosConfig.data = fd.toString();
      if (!hdrs['Content-Type'] && !hdrs['content-type']) {
        axiosConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
  }

  const response = await axios(axiosConfig);
  const time = Date.now() - start;
  let parsedBody = response.data;
  const ct = response.headers['content-type'] || '';
  if (typeof response.data === 'string' && ct.includes('application/json')) {
    try {
      parsedBody = JSON.parse(response.data);
    } catch {
      parsedBody = response.data;
    }
  }
  return {
    status: response.status,
    time,
    body: parsedBody,
    headers: response.headers,
  };
}
