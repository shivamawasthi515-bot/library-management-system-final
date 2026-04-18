const express = require('express');
const SearchLog = require('../models/SearchLog');
const User = require('../models/User');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

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
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, users });
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

module.exports = router;
