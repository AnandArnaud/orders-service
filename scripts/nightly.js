const { pool } = require('@saltmarsh/db');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set; the nightly summary needs a Postgres connection string. Exiting.');
  process.exit(1);
}

async function main() {
  const { rows } = await pool.query(`select status, count(*)::int as count from orders group by status order by status`);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const byStatus = rows.map((row) => `${row.status}=${row.count}`).join(' ');
  console.log(`${new Date().toISOString().slice(0, 10)} orders total=${total}${byStatus ? ` ${byStatus}` : ''}`);
  await pool.end();
}

main().catch((err) => {
  console.error(`nightly summary failed: ${err.message}`);
  process.exit(1);
});
