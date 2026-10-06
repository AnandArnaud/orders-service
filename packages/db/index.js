const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
// An idle client that loses its connection emits 'error' on the pool; unhandled, that exits the process.
pool.on('error', (err) => {
  console.error(`database: ${err.message}`);
});

async function migrate() {
  await pool.query(`
    create table if not exists orders (
      id           bigserial primary key,
      customer     text not null,
      total        numeric(12, 2) not null check (total >= 0),
      currency     char(3) not null,
      status       text not null default 'new' check (status in ('new', 'processed')),
      created_at   timestamptz not null default now(),
      processed_at timestamptz
    )
  `);
  await pool.query(`create index if not exists orders_new_idx on orders (id) where status = 'new'`);
}

module.exports = { pool, migrate };
