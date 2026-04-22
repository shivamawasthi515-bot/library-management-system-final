const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed', index: true },
    dueAt: { type: Date },
    returnedAt: { type: Date },
    fine: { type: Number, default: 0 },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

BorrowSchema.index({ user: 1, status: 1, createdAt: -1 });
BorrowSchema.index({ book: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Borrow', BorrowSchema);
