# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv`.

The ops team watches the `#orders` Slack channel for new orders.

## Slack notifications

Every added order posts a message to `#orders` through Relaybraid. `src/notify.js` calls the
Relaybraid `slack.send_message` action after the row is written; a failed notification is logged
and never blocks recording the order.

One-time setup: follow the `init` and `login` steps in the Relaybraid install guide
(https://relaybraid.com/t/cclaude1/docs/install) from the repo root. `login` saves the API key to
`.relaybraid/credentials.json`, which is git-ignored. In CI or on a server, set `RELAYBRAID_API_KEY` instead.
