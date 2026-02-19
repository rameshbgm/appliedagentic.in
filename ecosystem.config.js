// ecosystem.config.js — PM2 config for Hostinger VPS (standalone output)
module.exports = {
  apps: [
    {
      name: 'appliedagentic',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/appliedagentic.in',
      instances: 'max',          // cluster mode — uses all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      // Log configuration
      error_file: '/var/log/pm2/appliedagentic-error.log',
      out_file: '/var/log/pm2/appliedagentic-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
}
