import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const formattedAmount = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, formattedAmount].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const relaybraid = new Relaybraid({ setup: "9XGP5ST4" });
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} — $${formattedAmount}`,
});
console.log(`slack: ${result.status} (${result.run_id})`);
