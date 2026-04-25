import { Collection } from '../models/Collection.js';
import { ApiRequest } from '../models/Request.js';
import { HttpError } from '../middleware/errorHandler.js';

async function assertOwnerCollection(collectionId, userId) {
  const col = await Collection.findOne({ _id: collectionId, owner: userId });
  if (!col) throw new HttpError(404, 'Collection not found');
  return col;
}

export async function createRequest(req, res, next) {
  try {
    const col = await assertOwnerCollection(req.params.id, req.user._id);
    const folderIndex = Number(req.body.folderIndex) || 0;
    if (!col.folders[folderIndex]) throw new HttpError(400, 'Invalid folderIndex');
    const payload = req.body;
    const order = col.folders[folderIndex].requests.length;
    const doc = await ApiRequest.create({
      name: payload.name || 'Untitled',
      method: payload.method || 'GET',
      url: payload.url || '',
      headers: payload.headers || [],
      params: payload.params || [],
      body: payload.body || { type: 'none', content: null },
      preRequestScript: payload.preRequestScript || '',
      tests: payload.tests || '',
      collection: col._id,
      folderIndex,
      order,
    });
    col.folders[folderIndex].requests.push(doc._id);
    await col.save();
    const populated = await Collection.findById(col._id).populate('folders.requests').lean();
    res.status(201).json({ request: doc, collection: populated });
  } catch (e) {
    next(e);
  }
}

export async function updateRequest(req, res, next) {
  try {
    const doc = await ApiRequest.findById(req.params.id).populate('collection');
    if (!doc) throw new HttpError(404, 'Request not found');
    const col = doc.collection;
    if (!col || String(col.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Forbidden');
    }
    const allowed = ['name', 'method', 'url', 'headers', 'params', 'body', 'preRequestScript', 'tests', 'folderIndex', 'order'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) doc[k] = req.body[k];
    }
    await doc.save();
    const updatedCol = await Collection.findById(col._id).populate('folders.requests').lean();
    res.json({ request: doc, collection: updatedCol });
  } catch (e) {
    next(e);
  }
}

export async function deleteRequest(req, res, next) {
  try {
    const doc = await ApiRequest.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'Request not found');
    const col = await Collection.findById(doc.collection);
    if (!col || String(col.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Forbidden');
    }
    for (const folder of col.folders) {
      folder.requests = folder.requests.filter((id) => String(id) !== String(doc._id));
    }
    await col.save();
    await doc.deleteOne();
    const populated = await Collection.findById(col._id).populate('folders.requests').lean();
    res.json({ collection: populated });
  } catch (e) {
    next(e);
  }
}

export async function duplicateRequest(req, res, next) {
  try {
    const doc = await ApiRequest.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'Request not found');
    const col = await Collection.findById(doc.collection);
    if (!col || String(col.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Forbidden');
    }
    const folderIndex = doc.folderIndex ?? 0;
    const copy = await ApiRequest.create({
      name: `${doc.name} (copy)`,
      method: doc.method,
      url: doc.url,
      headers: doc.headers,
      params: doc.params,
      body: doc.body,
      preRequestScript: doc.preRequestScript,
      tests: doc.tests,
      collection: col._id,
      folderIndex,
      order: col.folders[folderIndex].requests.length,
    });
    col.folders[folderIndex].requests.push(copy._id);
    await col.save();
    const populated = await Collection.findById(col._id).populate('folders.requests').lean();
    res.status(201).json({ request: copy, collection: populated });
  } catch (e) {
    next(e);
  }
}
