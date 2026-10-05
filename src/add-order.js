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

const clientId = process.env.RELAYBRAID_CLIENT_ID;
const clientSecret = process.env.RELAYBRAID_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Slack notification failed: set RELAYBRAID_CLIENT_ID and RELAYBRAID_CLIENT_SECRET.");
  process.exit(1);
}

const relaybraid = new Relaybraid({ clientId, clientSecret });
try {
  const result = await relaybraid.run("slack.send_message", {
    channel: "#orders",
    text: `New order received: ${customer} ${formatted}`,
  });
  console.log(`slack: ${result.status}${result.run_id ? ` ${result.run_id}` : ""}`);
} catch (error) {
  console.error(`Slack notification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
