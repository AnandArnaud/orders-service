# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to the `#orders` Slack channel through Relaybraid.

Sign in once from the project root so the notifier can run:

```bash
npx -y https://relaybraid.com/dl/relaybraid-cli.tgz login
```

The API key is saved in `.relaybraid/credentials.json` (gitignored). `RELAYBRAID_API_KEY` overrides that file.
