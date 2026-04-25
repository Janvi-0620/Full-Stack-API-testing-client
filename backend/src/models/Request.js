import mongoose from 'mongoose';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const headerPairSchema = new mongoose.Schema(
  { key: String, value: String, enabled: { type: Boolean, default: true } },
  { _id: false }
);

const bodySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['json', 'formdata', 'raw', 'none'], default: 'none' },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    method: { type: String, enum: METHODS, default: 'GET' },
    url: { type: String, default: '' },
    headers: { type: [headerPairSchema], default: [] },
    params: { type: [headerPairSchema], default: [] },
    body: { type: bodySchema, default: () => ({ type: 'none', content: null }) },
    preRequestScript: { type: String, default: '' },
    tests: { type: String, default: '' },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
    folderIndex: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const ApiRequest = mongoose.model('ApiRequest', requestSchema);
