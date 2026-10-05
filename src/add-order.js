import { appendFile, readFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountFormatted = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, amountFormatted].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const { setup } = JSON.parse(await readFile(new URL("../.relaybraid/config.json", import.meta.url), "utf8"));
const relaybraid = new Relaybraid({ setup });
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} (${amountFormatted})`,
});
console.log(`slack: status=${result.status} run_id=${result.run_id}`);
