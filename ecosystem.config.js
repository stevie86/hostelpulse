module.exports = {
  apps: [
    {
      name: 'hostelpulse-dev',
      script: 'npx',
      args: 'next dev',
      interpreter: 'bash',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};