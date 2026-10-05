# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through Relaybraid.

The ops team watches `#orders` for new orders. Relaybraid credentials live in `.relaybraid/credentials.json` (or `RELAYBRAID_API_KEY`) and are not committed.
