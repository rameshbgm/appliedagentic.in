// ecosystem.config.js — PM2 config for Hostinger shared hosting
module.exports = {
  apps: [
    {
      name: 'appliedagentic',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/home/u915919430/domains/appliedagentic.in/public_html',
      instances: 'max',          // cluster mode — uses all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      // Log configuration — stored outside public_html so they are not web-accessible
      error_file: '/home/u915919430/domains/appliedagentic.in/logs/error.log',
      out_file: '/home/u915919430/domains/appliedagentic.in/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
}
