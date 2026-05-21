const si = require('systeminformation');

module.exports = (logger) => {
  const router = require('express').Router();

  // Simple health check
  router.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Detailed health (CPU, memory, disk)
  router.get('/detailed', async (req, res) => {
    try {
      const [cpu, memory, disk] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize()
      ]);
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          cpu: {
            load: cpu.currentLoad.toFixed(2),
            cores: cpu.cpus.length
          },
          memory: {
            total: (memory.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            used: (memory.active / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            percent: ((memory.active / memory.total) * 100).toFixed(2)
          },
          disk: disk.map(d => ({
            mount: d.mount,
            used: (d.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            available: (d.available / 1024 / 1024 / 1024).toFixed(2) + ' GB',
            percent: d.use
          }))
        }
      });
    } catch (error) {
      logger.error('Health check failed: ' + error.message);
      res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  });

  // Docker health check endpoint
  router.get('/docker', (req, res) => {
    res.status(200).send('OK');
  });

  return router;
};