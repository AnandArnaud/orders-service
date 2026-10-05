// Posts a "new order" message to the #orders Slack channel.
//
// TODO(relaybraid): wire this up per https://relaybraid.com/t/cclaude1/docs/install
// The docs host was unreachable from the environment where this was scaffolded,
// so the Relaybraid client is not installed or configured yet. Until it is,
// this logs a warning and returns without posting.

export const SLACK_CHANNEL = "#orders";

export function formatOrderMessage({ created_at, customer, amount }) {
  return `New order: ${customer} — $${amount} (${created_at})`;
}

export async function notifyOrderAdded(order) {
  const text = formatOrderMessage(order);
  if (!process.env.RELAYBRAID_CONFIGURED) {
    console.warn(`[notify] Relaybraid not configured; would post to ${SLACK_CHANNEL}: ${text}`);
    return false;
  }
  // Relaybraid send call goes here.
  throw new Error("Relaybraid notifier not implemented yet");
}
