const endpointStats = new Map();
let totalRequests = 0;
let totalErrors = 0;

function requestLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - started;
    const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    console.log(line);
  });
  next();
}

function metricsCollector(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    totalRequests += 1;
    if (res.statusCode >= 400) totalErrors += 1;

    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
    const key = `${req.method} ${req.route?.path || req.path}`;
    const prev = endpointStats.get(key) || { count: 0, totalMs: 0, maxMs: 0, minMs: Infinity };

    prev.count += 1;
    prev.totalMs += elapsedMs;
    prev.maxMs = Math.max(prev.maxMs, elapsedMs);
    prev.minMs = Math.min(prev.minMs, elapsedMs);

    endpointStats.set(key, prev);
  });
  next();
}

function getMetricsSnapshot() {
  const endpoints = [];
  for (const [endpoint, v] of endpointStats.entries()) {
    endpoints.push({
      endpoint,
      count: v.count,
      avgMs: Number((v.totalMs / v.count).toFixed(2)),
      maxMs: Number(v.maxMs.toFixed(2)),
      minMs: Number((v.minMs === Infinity ? 0 : v.minMs).toFixed(2))
    });
  }

  return {
    totalRequests,
    totalErrors,
    errorRate: totalRequests ? Number(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
    endpoints
  };
}

module.exports = { requestLogger, metricsCollector, getMetricsSnapshot };
