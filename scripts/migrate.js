const { pool, migrate } = require('@saltmarsh/db');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set; nothing to migrate. Exiting.');
  process.exit(1);
}

migrate()
  .then(() => {
    console.log('orders table is ready');
    return pool.end();
  })
  .catch((err) => {
    console.error(`migrate failed: ${err.message}`);
    process.exit(1);
  });
