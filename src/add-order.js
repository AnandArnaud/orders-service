import { appendFile, readFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountValue = Number(amount);
if (!Number.isFinite(amountValue)) {
  console.error("Amount must be a number.");
  process.exit(1);
}

const formatted = amountValue.toFixed(2);
const row = [new Date().toISOString(), customer, formatted].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const config = JSON.parse(await readFile(new URL("../.relaybraid/config.json", import.meta.url), "utf8"));
const relaybraid = new Relaybraid({ setup: config.setup });
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} (${formatted})`,
});
console.log(`slack: ${result.status} ${result.run_id ?? ""}`.trim());
