import mongoose from 'mongoose';

const variableSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const environmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    variables: { type: [variableSchema], default: [] },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

environmentSchema.index({ user: 1, name: 1 }, { unique: true });

export const Environment = mongoose.model('Environment', environmentSchema);
