# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts it to the `#orders` Slack channel through Relaybraid.

The ops team watches `#orders` for new orders. Relaybraid is set up in `.relaybraid/`; the API key stays in `.relaybraid/credentials.json` (gitignored) or `RELAYBRAID_API_KEY`.
