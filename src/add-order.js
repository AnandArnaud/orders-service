import { appendFile, readFile } from "node:fs/promises";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const amountText = Number(amount).toFixed(2);
if (!Number.isFinite(Number(amount))) {
  console.error("Amount must be a number.");
  process.exit(1);
}

const row = [new Date().toISOString(), customer, amountText].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const hookUrl = process.env.RELAYBRAID_HOOK_URL ?? (await readHookUrl());
const response = await fetch(hookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "#orders",
    text: `New order received: ${customer} (${amountText})`,
  }),
});
const body = await response.text();
let data = null;
try {
  data = JSON.parse(body);
} catch {
  data = null;
}
if (!response.ok || data?.status !== "success") {
  console.error(`Slack notification failed (${response.status}): ${data?.error?.message ?? body.slice(0, 200)}`);
  process.exit(1);
}
console.log(`slack notified: ${data.status} ${data.run_id}`);

async function readHookUrl() {
  try {
    const hook = JSON.parse(await readFile(new URL("../.relaybraid/hook.json", import.meta.url), "utf8"));
    if (typeof hook.url === "string" && hook.url) return hook.url;
  } catch {
    // Fall through to the error below.
  }
  console.error("Slack hook is not configured. Set RELAYBRAID_HOOK_URL or .relaybraid/hook.json.");
  process.exit(1);
}
