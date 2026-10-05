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
console.log(`order recorded: ${row}`);

// Links this client to the SDK guide for this workspace.
const relaybraid = new Relaybraid({ setup: "RA71XN40" });
try {
  const result = await relaybraid.run("slack.send_message", {
    channel: "#orders",
    text: `New order received: ${customer} ${amountFormatted}`,
  });
  console.log(`slack: ${result.status}${result.run_id ? ` (${result.run_id})` : ""}`);
} catch (error) {
  console.error(`order was recorded, but the Slack notification failed: ${error.message}`);
  process.exit(1);
}
