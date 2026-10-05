import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const formatted = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, formatted].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const relaybraid = await Relaybraid.trial({ setup: "0VFRB5P8" });
if (relaybraid.claimUrl) console.log(`Claim link: ${relaybraid.claimUrl}`);

const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} ${formatted}`,
});
console.log(`slack: ${result.status}${result.run_id ? ` (${result.run_id})` : ""}`);
