import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Default' },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ApiRequest' }],
  },
  { _id: true }
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: null, index: true, sparse: true },
    folders: { type: [folderSchema], default: () => [{ name: 'Default', requests: [] }] },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

collectionSchema.index({ owner: 1, name: 1 });

export const Collection = mongoose.model('Collection', collectionSchema);
