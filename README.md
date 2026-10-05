# orders-service

Small internal tool. `npm run add-order -- "<customer>" <amount>` appends a row to `orders.csv` and posts the order to `#orders` through a Relaybraid Catch Hook.

The ops team watches the `#orders` Slack channel for new orders.
