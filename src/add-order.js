import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const formattedAmount = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, formattedAmount].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

await notifyOrder(customer, formattedAmount);

async function notifyOrder(customer, amount) {
  const apiKey = await relaybraidApiKey();
  const response = await fetch("https://relaybraid.com/api/v1/actions/run", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "slack.send_message",
      input: {
        channel: "#orders",
        text: `New order received: ${customer} ${amount}`,
      },
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status !== "success") {
    const message = result?.error?.message ?? result.status ?? response.status;
    console.error(`slack notification failed: ${message}`);
    process.exit(1);
  }
  console.log(`slack notified: ${result.status} ${result.run_id}`);
}

async function relaybraidApiKey() {
  if (process.env.RELAYBRAID_API_KEY) return process.env.RELAYBRAID_API_KEY;
  const path = new URL("../.relaybraid/credentials.json", import.meta.url);
  if (!existsSync(path)) {
    console.error("Relaybraid API key not found. Set RELAYBRAID_API_KEY or run relaybraid init.");
    process.exit(1);
  }
  const credentials = JSON.parse(await readFile(path, "utf8"));
  if (!credentials.api_key) {
    console.error("Relaybraid credentials file is missing api_key.");
    process.exit(1);
  }
  return credentials.api_key;
}
