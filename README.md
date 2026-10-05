# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel.

Slack delivery goes through a Relaybraid Catch Hook for `slack.send_message`. The hook URL is read from `RELAYBRAID_HOOK_URL` or `.relaybraid/hook.json` (gitignored). Create that hook with `npx -y https://relaybraid.com/dl/relaybraid-cli.tgz hooks create --action slack.send_message` after `init` and `login`.
