const buckets = new Map();

function rateLimit({ windowMs = 60_000, max = 120 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const current = buckets.get(key);
    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
    }

    current.count += 1;
    return next();
  };
}

module.exports = { rateLimit };
