import { appendFile } from "node:fs/promises";
import { notifyOrderAdded } from "./notify.js";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const order = {
  created_at: new Date().toISOString(),
  customer,
  amount: Number(amount).toFixed(2),
};
const row = [order.created_at, order.customer, order.amount].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

try {
  await notifyOrderAdded(order);
} catch (err) {
  // Recording the order must not fail because the Slack notification did.
  console.error(`[notify] failed to post to Slack: ${err.message}`);
}
