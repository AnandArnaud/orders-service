import { appendFile, readFile } from "node:fs/promises";

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

const row = [new Date().toISOString(), customer, amountValue.toFixed(2)].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const apiKey =
  process.env.RELAYBRAID_API_KEY ??
  JSON.parse(await readFile(new URL("../.relaybraid/credentials.json", import.meta.url), "utf8")).api_key;

const response = await fetch("https://relaybraid.com/api/v1/actions/run", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    app: "slack",
    action: "send_message",
    input: {
      channel: "#orders",
      text: `New order received: ${customer} $${amountValue.toFixed(2)}`,
    },
  }),
});

const result = await response.json().catch(() => null);
if (!response.ok || result?.status !== "success") {
  console.error(`slack notify failed: ${result?.error?.message ?? response.status}`);
  process.exit(1);
}

console.log(`slack notified: status ${result.status}, run_id ${result.run_id}`);
