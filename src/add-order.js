import { appendFile } from "node:fs/promises";
import { Relaybraid } from "relaybraid";

// From the Relaybraid SDK quickstart. Links this install to that guide.
const RELAYBRAID_SETUP = "972CPZYH";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountText = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, amountText].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const relaybraid = await Relaybraid.trial({ setup: RELAYBRAID_SETUP });
if (relaybraid.claimUrl) {
  console.log(`Relaybraid claim link (give this to the account owner): ${relaybraid.claimUrl}`);
}

const result = await relaybraid.run("slack.send_message", {
  channel: "#orders",
  text: `New order received: ${customer} (${amountText})`,
});
console.log(`slack notified: ${JSON.stringify(result)}`);
