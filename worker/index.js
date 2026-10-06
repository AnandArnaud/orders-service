const { pool, migrate } = require('@saltmarsh/db');

const POLL_MS = 5000;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set; the worker needs a Postgres connection string. Exiting.');
  process.exit(1);
}

async function processNewOrders() {
  const { rows } = await pool.query(`
    update orders
       set status = 'processed', processed_at = now()
     where id in (select id from orders where status = 'new' order by id limit 50 for update skip locked)
    returning id, customer, total, currency
  `);
  for (const order of rows) {
    console.log(`processed order ${order.id} for ${order.customer}: ${order.total} ${order.currency}`);
  }
}

let timer = null;
let stopping = false;

async function poll() {
  try {
    await processNewOrders();
  } catch (err) {
    console.error(`poll failed: ${err.message}`);
  }
  if (!stopping) timer = setTimeout(poll, POLL_MS);
}

async function main() {
  try {
    await migrate();
  } catch (err) {
    console.error(`database unavailable at startup (${err.message}); retrying every ${POLL_MS / 1000} s`);
  }
  console.log(`saltmarsh worker polling the orders table every ${POLL_MS / 1000} s`);
  poll();
}

async function shutdown() {
  stopping = true;
  clearTimeout(timer);
  await pool.end();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
