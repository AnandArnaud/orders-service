import { appendFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const [customer, amount] = process.argv.slice(2);
if (!customer || !amount) {
  console.error("Usage: npm run add-order -- <customer> <amount>");
  process.exit(1);
}

const formattedAmount = Number(amount).toFixed(2);
const row = [new Date().toISOString(), customer, formattedAmount].join(",");
await appendFile(new URL("../orders.csv", import.meta.url), `${row}\n`);
console.log(`order recorded: ${row}`);

const hookUrl = await relaybraidHookUrl();
if (!hookUrl) {
  console.error("Slack notification failed: set RELAYBRAID_HOOK_URL or .relaybraid/hook.json");
  process.exit(1);
}

const response = await fetch(hookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "#orders",
    text: `New order received: ${customer} — ${formattedAmount}`,
  }),
});
const body = await response.text();
let result = null;
try {
  result = JSON.parse(body);
} catch {
  result = null;
}
if (!response.ok || result?.status === "error") {
  console.error(`Slack notification failed (${response.status}): ${body.slice(0, 300)}`);
  process.exit(1);
}
console.log(`slack notified: ${result?.status ?? response.status}${result?.run_id ? ` (${result.run_id})` : ""}`);

async function relaybraidHookUrl() {
  if (process.env.RELAYBRAID_HOOK_URL) return process.env.RELAYBRAID_HOOK_URL;
  const path = new URL("../.relaybraid/hook.json", import.meta.url);
  if (!existsSync(path)) return null;
  const data = JSON.parse(await readFile(path, "utf8"));
  return typeof data.url === "string" ? data.url : null;
}
