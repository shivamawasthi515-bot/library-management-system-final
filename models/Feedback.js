const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, default: 5 }
  },
  { timestamps: true }
);

FeedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
