const { exec } = require('child_process');
const si = require('systeminformation');

module.exports = (logger) => {
  const router = require('express').Router();

  // Authentication middleware for sensitive endpoints
  const auth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
  };

  // Get system info
  router.get('/info', async (req, res) => {
    try {
      const [os, time, network] = await Promise.all([
        si.osInfo(),
        si.time(),
        si.networkInterfaces()
      ]);
      res.json({
        hostname: os.hostname,
        platform: os.platform,
        distro: os.distro,
        uptime: time.uptime,
        network: network.filter(n => n.operstate === 'up').map(n => ({
          interface: n.iface,
          ip4: n.ip4,
          mac: n.mac
        }))
      });
    } catch (error) {
      logger.error('System info failed: ' + error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Execute command (secured)
  router.post('/exec', auth, (req, res) => {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }
    logger.info(`Executing command: ${command}`);
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Command failed: ${error.message}`);
        return res.status(500).json({ error: error.message, stderr });
      }
      res.json({ stdout, stderr });
    });
  });

  // Get running processes
  router.get('/processes', async (req, res) => {
    try {
      const processes = await si.processes();
      res.json({
        total: processes.all,
        running: processes.running,
        top_cpu: processes.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 10)
          .map(p => ({ pid: p.pid, name: p.name, cpu: p.cpu, mem: p.mem }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};