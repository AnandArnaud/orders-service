# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through Relaybraid.

The ops team watches the `#orders` Slack channel for new orders. Sign in once with the Relaybraid CLI (`login`) so the API key is saved in `.relaybraid/credentials.json`.
