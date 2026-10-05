import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountFormatted = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, amountFormatted].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);

const relaybraid = new Relaybraid({ setup: "CC0750TY" });
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} (${amountFormatted})`,
});

console.log(`order recorded: ${row}`);
console.log(`slack ${result.status}: ${result.run_id}`);
