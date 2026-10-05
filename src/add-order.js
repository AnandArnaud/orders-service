import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountText = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, amountText].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const relaybraid = new Relaybraid({
  clientId: process.env.RELAYBRAID_CLIENT_ID,
  clientSecret: process.env.RELAYBRAID_CLIENT_SECRET,
});
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} ${amountText}`,
});
console.log(`slack notified: ${result.status} ${result.run_id}`);
