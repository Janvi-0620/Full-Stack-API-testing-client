import { executeHttpRequest } from '../utils/requestExecutor.js';
import { HttpError } from '../middleware/errorHandler.js';
import { saveHistoryEntry } from './historyController.js';

export async function executeProxy(req, res, next) {
  try {
    const { method, url, headers, params, body } = req.body || {};
    if (!url || typeof url !== 'string') {
      throw new HttpError(400, 'url is required');
    }
    if (!/^https?:\/\//i.test(url)) {
      throw new HttpError(400, 'url must be an absolute http(s) URL');
    }
    const result = await executeHttpRequest({ method, url, headers, params, body });

    if (req.user) {
      try {
        await saveHistoryEntry(req.user._id, { method, url, headers, params, body }, result);
      } catch (histErr) {
        console.error('History save failed', histErr);
      }
    }

    res.json(result);
  } catch (e) {
    if (e.code === 'ECONNABORTED') {
      return next(new HttpError(504, 'Request timeout'));
    }
    if (e.response) {
      return res.json({
        status: e.response.status,
        time: 0,
        body: e.response.data,
        headers: e.response.headers,
      });
    }
    next(e);
  }
}
