const express = require('express');
const SearchLog = require('../models/SearchLog');
const User = require('../models/User');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.use(authRequired, requireRole('admin'));

router.get('/analytics/searches', async (req, res) => {
  try {
    const [top, recent] = await Promise.all([
      SearchLog.find({}).sort({ count: -1, lastSearchedAt: -1 }).limit(20).lean(),
      SearchLog.find({}).sort({ lastSearchedAt: -1 }).limit(20).lean()
    ]);

    return res.json({ success: true, top, recent });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : '';

    const filter = search
      ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { email: { $regex: escapeRegex(search), $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    return res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const role = String(req.body?.role || '').toLowerCase();
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'role must be user or admin' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:id/active', async (req, res) => {
  try {
    const isActive = req.body?.isActive;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isActive (boolean) is required' });
    }

    // Prevent an admin from deactivating themselves
    if (String(req.user._id) === String(req.params.id) && !isActive) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
