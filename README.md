# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through a Relaybraid Catch Hook.

The hook URL is read from `RELAYBRAID_HOOK_URL` or `.relaybraid/hook.json`. That file holds the workspace hook id and stays out of source control.
