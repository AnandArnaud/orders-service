import { appendFile, readFile } from "node:fs/promises";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const createdAt = new Date().toISOString();
const amountText = Number(amount).toFixed(2);
const row = [createdAt, customer, amountText].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);

const hookUrl = await relaybraidHookUrl();
const response = await fetch(hookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "#orders",
    text: `New order received: ${customer} ${amountText}`,
  }),
});
const bodyText = await response.text();
let body = null;
try {
  body = JSON.parse(bodyText);
} catch {
  body = null;
}
if (!response.ok || body?.status !== "success") {
  const detail = body?.error?.message ?? bodyText.slice(0, 200);
  console.error(`order recorded, but Slack notify failed (${response.status}): ${detail}`);
  process.exit(1);
}

console.log(`order recorded: ${row}`);
console.log(`slack notified: ${body.run_id}`);

async function relaybraidHookUrl() {
  if (process.env.RELAYBRAID_HOOK_URL) return process.env.RELAYBRAID_HOOK_URL;
  const raw = await readFile(new URL("../.relaybraid/hook.json", import.meta.url), "utf8");
  const parsed = JSON.parse(raw);
  if (typeof parsed.url !== "string" || parsed.url.length === 0) {
    throw new Error("missing url in .relaybraid/hook.json");
  }
  return parsed.url;
}
