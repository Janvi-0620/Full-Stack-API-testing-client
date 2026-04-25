import { History } from '../models/History.js';
import { HttpError } from '../middleware/errorHandler.js';

const MAX_PER_USER = 100;

export async function listHistory(req, res, next) {
  try {
    const { status, method, from, to } = req.query;
    const filter = { user: req.user._id };
    if (status) filter['response.status'] = Number(status);
    if (method) filter['request.method'] = String(method).toUpperCase();
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }
    const items = await History.find(filter).sort({ timestamp: -1 }).limit(100).lean();
    res.json({ history: items });
  } catch (e) {
    next(e);
  }
}

export async function saveHistoryEntry(userId, requestSnapshot, responseSnapshot) {
  await History.create({
    user: userId,
    request: requestSnapshot,
    response: responseSnapshot,
    timestamp: new Date(),
  });
  const count = await History.countDocuments({ user: userId });
  if (count > MAX_PER_USER) {
    const oldest = await History.find({ user: userId }).sort({ timestamp: 1 }).limit(count - MAX_PER_USER).select('_id');
    await History.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
  }
}

export async function deleteHistory(req, res, next) {
  try {
    const doc = await History.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) throw new HttpError(404, 'History entry not found');
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
