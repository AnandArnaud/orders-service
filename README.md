# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts it to the `#orders` Slack channel through Relaybraid.

Copy `.env.example` to `.env` and set `RELAYBRAID_CLIENT_ID` and `RELAYBRAID_CLIENT_SECRET` before adding orders. The ops team watches `#orders` for new orders.
