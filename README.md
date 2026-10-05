# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to `#orders` through Relaybraid (`slack.send_message`).

The API key is read from `.relaybraid/credentials.json` (not committed) or `RELAYBRAID_API_KEY`.

The ops team watches the `#orders` Slack channel for new orders.
