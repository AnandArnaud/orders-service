# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through a Relaybraid catch hook.

The hook URL is read from `RELAYBRAID_HOOK_URL` or `.relaybraid/hook.json`. That URL and the API key in `.relaybraid/credentials.json` stay out of source control.
