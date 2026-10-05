# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through [Relaybraid](https://relaybraid.com/t/cuimpcpt/docs/install).

Relaybraid is initialized in `.relaybraid/`. Sign in once with `npx -y https://relaybraid.com/dl/relaybraid-cli.tgz login` so the API key is saved in `.relaybraid/credentials.json` (gitignored). The order command reads that key.
