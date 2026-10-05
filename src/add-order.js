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
console.log(`order recorded: ${row}`);

const hookUrl = await catchHookUrl();
const response = await fetch(hookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    channel: "#orders",
    text: `New order: ${customer} (${amountText})`,
  }),
});
const result = await response.json().catch(() => null);
if (!response.ok || result?.status !== "success") {
  const detail = result?.error?.message ?? result?.status ?? response.status;
  console.error(`slack notify failed: ${detail}`);
  process.exit(1);
}
console.log(`slack notified: ${result.run_id}`);

async function catchHookUrl() {
  if (process.env.RELAYBRAID_HOOK_URL) return process.env.RELAYBRAID_HOOK_URL;
  try {
    const raw = await readFile(new URL("../.relaybraid/hook.json", import.meta.url), "utf8");
    const url = JSON.parse(raw).url;
    if (typeof url === "string" && url.length > 0) return url;
  } catch {
    // Local hook config is optional when RELAYBRAID_HOOK_URL is set.
  }
  console.error("No Relaybraid catch hook. Set RELAYBRAID_HOOK_URL or .relaybraid/hook.json.");
  process.exit(1);
}
