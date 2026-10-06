const express = require('express');
const { pool, migrate } = require('@saltmarsh/db');

const PORT = Number(process.env.PORT) || 3000;
const COLUMNS = 'id, customer, total, currency, status, created_at, processed_at';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(`select ${COLUMNS} from orders order by id desc limit 100`);
    res.json({ orders: rows });
  } catch (err) {
    res.status(503).json({ error: 'database unavailable', detail: err.message });
  }
});

app.post('/orders', async (req, res) => {
  const { customer, total, currency } = req.body ?? {};
  const problems = [];
  if (typeof customer !== 'string' || customer.trim().length === 0) {
    problems.push('customer must be a non-empty string');
  }
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) {
    problems.push('total must be a non-negative number');
  }
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    problems.push('currency must be a three-letter ISO 4217 code');
  }
  if (problems.length > 0) {
    return res.status(400).json({ error: 'invalid order', problems });
  }
  try {
    const { rows } = await pool.query(
      `insert into orders (customer, total, currency) values ($1, $2, $3) returning ${COLUMNS}`,
      [customer.trim(), total, currency],
    );
    res.status(201).json({ order: rows[0] });
  } catch (err) {
    res.status(503).json({ error: 'database unavailable', detail: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.message });
});

if (process.env.DATABASE_URL) {
  migrate().catch((err) => {
    console.error(`database unavailable at startup (${err.message}); /orders answers 503 until it is reachable`);
  });
} else {
  console.error('DATABASE_URL is not set; /orders answers 503 until it is');
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`saltmarsh web listening on 0.0.0.0:${PORT}`);
});

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
