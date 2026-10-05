import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const createdAt = new Date().toISOString();
const amountText = Number(amount).toFixed(2);
const row = [createdAt, customer, amountText].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const relaybraid = await Relaybraid.trial({ setup: "0DH0KX6M" });
if (relaybraid.claimUrl) {
  console.log(`Relaybraid claim link: ${relaybraid.claimUrl}`);
}

const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order: ${customer} — $${amountText} (${createdAt})`,
});
console.log(`posted to #orders: ${result.status}${result.run_id ? ` ${result.run_id}` : ""}`);
