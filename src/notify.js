// Posts a "new order" message to the #orders Slack channel via Relaybraid.
// Setup: https://relaybraid.com/t/cclaude1/docs/install
//
// Credentials come from RELAYBRAID_API_KEY, or from .relaybraid/credentials.json
// (written by `relaybraid login`; git-ignored).

import { readFile } from "node:fs/promises";

export const SLACK_CHANNEL = "#orders";

const RELAYBRAID_DIR = new URL("../.relaybraid/", import.meta.url);

async function readJson(url) {
  try {
    return JSON.parse(await readFile(url, "utf8"));
  } catch {
    return null;
  }
}

async function loadSettings() {
  const config = await readJson(new URL("config.json", RELAYBRAID_DIR));
  const credentials = await readJson(new URL("credentials.json", RELAYBRAID_DIR));
  return {
    origin: process.env.RELAYBRAID_ORIGIN || config?.origin || "https://relaybraid.com",
    installId: config?.install_id ?? null,
    apiKey: process.env.RELAYBRAID_API_KEY || credentials?.api_key || null,
  };
}

export function formatOrderMessage({ created_at, customer, amount }) {
  return `New order: ${customer} — $${amount} (${created_at})`;
}

export async function notifyOrderAdded(order) {
  const { origin, installId, apiKey } = await loadSettings();
  if (!apiKey) {
    throw new Error("Relaybraid is not signed in. Run `relaybraid login` or set RELAYBRAID_API_KEY.");
  }

  const headers = {
    authorization: `Bearer ${apiKey}`,
    "content-type": "application/json",
  };
  if (installId) headers["x-relaybraid-install"] = installId;

  const response = await fetch(`${origin}/api/v1/actions/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: "slack.send_message",
      input: { channel: SLACK_CHANNEL, text: formatOrderMessage(order) },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Relaybraid returned ${response.status}: ${text.slice(0, 200)}`);
  }
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // non-JSON body; nothing more to report
  }
  console.log(`[notify] posted to ${SLACK_CHANNEL}${data?.run_id ? ` (run ${data.run_id})` : ""}`);
  return data;
}
