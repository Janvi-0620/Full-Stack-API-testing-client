import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    request: {
      method: String,
      url: String,
      headers: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
    },
    response: {
      status: Number,
      time: Number,
      body: mongoose.Schema.Types.Mixed,
      headers: mongoose.Schema.Types.Mixed,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

historySchema.index({ user: 1, timestamp: -1 });

export const History = mongoose.model('History', historySchema);
