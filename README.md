# Saltmarsh Orders

Saltmarsh Orders: web API, worker and a nightly summary job sharing one Postgres database.

- `web/` Express API: `GET /health`, `GET /orders`, `POST /orders`
- `worker/` polls the `orders` table every 5 s for rows with status `new` and marks them `processed`
- `scripts/nightly.js` prints a one-line summary of orders by status and exits; meant to run once a day
- `packages/db` the shared Postgres pool and `migrate()`, which creates the `orders` table if it is missing

## Run locally

The compose file at the repo root starts Postgres 16 and Redis 7 for local development only;
the services use Postgres. Bring it up, then:

    export DATABASE_URL=postgres://saltmarsh:saltmarsh@127.0.0.1:5432/saltmarsh
    npm install
    npm run migrate
    npm run web              # http://localhost:3000
    npm run worker           # in a second terminal
    npm run nightly

Create an order:

    curl -s -X POST localhost:3000/orders -H 'content-type: application/json' \
      -d '{"customer":"Mara Finch","total":18.75,"currency":"EUR"}'

## Environment

- `DATABASE_URL` Postgres connection string. Required by the worker, the migration and the
  nightly job; the web API starts without it but `/orders` answers 503 until it is set.
- `PORT` web API port (default 3000)
