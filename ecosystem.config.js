module.exports = {
  apps: [{
    name:         'mef-portal',
    script:       'server.js',
    instances:    1,
    autorestart:  true,
    watch:        false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT:     3000,
    },
    error_file:  '/var/log/mef-portal/error.log',
    out_file:    '/var/log/mef-portal/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
