import { useCallback, useState } from 'react';
import { api } from '../api/client.js';
import { interpolateString, interpolateValue } from '../utils/interpolate.js';

export function useRequest() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (draft, variableMap) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const url = interpolateString(draft.url || '', variableMap);
      const headers = interpolateValue(draft.headers || [], variableMap);
      const params = interpolateValue(draft.params || [], variableMap);
      let body = draft.body || { type: 'none', content: null };
      if (body.type === 'json' && body.content != null) {
        const raw =
          typeof body.content === 'string' ? body.content : JSON.stringify(body.content, null, 2);
        const str = interpolateString(raw, variableMap);
        try {
          body = { ...body, content: JSON.parse(str) };
        } catch {
          body = { ...body, content: str };
        }
      } else if (body.type === 'raw' && body.content != null) {
        body = {
          ...body,
          content: interpolateString(String(body.content), variableMap),
        };
      } else if (body.type === 'formdata' && body.content && typeof body.content === 'object') {
        body = { ...body, content: interpolateValue(body.content, variableMap) };
      }

      const data = await api('/api/proxy/execute', {
        method: 'POST',
        body: {
          method: draft.method || 'GET',
          url,
          headers,
          params,
          body,
        },
      });
      setResponse(data);
      return data;
    } catch (e) {
      setError(e.message || 'Request failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { execute, loading, response, error, clear };
}
