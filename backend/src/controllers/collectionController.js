import { Collection } from '../models/Collection.js';
import { ApiRequest } from '../models/Request.js';
import { HttpError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

async function loadCollectionForUser(id, userId, { publicShare } = {}) {
  const q = publicShare
    ? { shareToken: id, isPublic: true }
    : { _id: id, owner: userId };
  const col = await Collection.findOne(q)
    .populate({
      path: 'folders.requests',
      model: 'ApiRequest',
    })
    .lean();
  if (!col) throw new HttpError(404, 'Collection not found');
  return col;
}

export async function listCollections(req, res, next) {
  try {
    const list = await Collection.find({ owner: req.user._id }).sort({ updatedAt: -1 }).lean();
    res.json({ collections: list });
  } catch (e) {
    next(e);
  }
}

export async function createCollection(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) throw new HttpError(400, 'name is required');
    const col = await Collection.create({
      name: name.trim(),
      description: description || '',
      owner: req.user._id,
      folders: [{ name: 'Default', requests: [] }],
    });
    res.status(201).json({ collection: col });
  } catch (e) {
    next(e);
  }
}

export async function getCollection(req, res, next) {
  try {
    const col = await loadCollectionForUser(req.params.id, req.user._id);
    res.json({ collection: col });
  } catch (e) {
    next(e);
  }
}

export async function getSharedCollection(req, res, next) {
  try {
    const col = await loadCollectionForUser(req.params.token, null, { publicShare: true });
    res.json({ collection: col, readOnly: true });
  } catch (e) {
    next(e);
  }
}

export async function updateCollection(req, res, next) {
  try {
    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) throw new HttpError(404, 'Collection not found');
    const { name, description, folders } = req.body;
    if (name != null) col.name = String(name).trim();
    if (description != null) col.description = description;
    if (Array.isArray(folders)) {
      col.folders = folders.map((f) => ({
        _id: f._id,
        name: f.name || 'Folder',
        requests: (f.requests || []).map((r) => (r && typeof r === 'object' && r._id ? r._id : r)),
      }));
    }
    await col.save();
    const populated = await Collection.findById(col._id).populate('folders.requests').lean();
    res.json({ collection: populated });
  } catch (e) {
    next(e);
  }
}

export async function deleteCollection(req, res, next) {
  try {
    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) throw new HttpError(404, 'Collection not found');
    const ids = col.folders.flatMap((f) => f.requests.map((r) => r));
    await ApiRequest.deleteMany({ _id: { $in: ids } });
    await col.deleteOne();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function shareCollection(req, res, next) {
  try {
    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) throw new HttpError(404, 'Collection not found');
    if (!col.shareToken) {
      col.shareToken = crypto.randomBytes(16).toString('hex');
    }
    col.isPublic = true;
    await col.save();
    res.json({
      shareToken: col.shareToken,
      shareUrl: `/share/${col.shareToken}`,
    });
  } catch (e) {
    next(e);
  }
}
