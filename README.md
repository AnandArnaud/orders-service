# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through Relaybraid.

The ops team watches `#orders` for new orders. Slack credentials stay in `.relaybraid/credentials.json` (gitignored). Sign in with `npx -y https://relaybraid.com/dl/relaybraid-cli.tgz login` if that file is missing.
