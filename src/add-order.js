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

// Setup code from the Relaybraid SDK quickstart; the client reads the key saved by `login`.
const relaybraid = new Relaybraid({ setup: "2VM1307W" });
const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} ${formattedAmount}`,
});

if (result?.status !== "success") {
  console.error(`slack notify failed: ${JSON.stringify(result)}`);
  process.exit(1);
}

console.log(`slack notified: ${result.status} ${result.run_id}`);
