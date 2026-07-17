import prisma from '../config/database';

export async function fireWebhook(userId: string, eventType: string, data: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, eventType, active: true },
  });

  const results = await Promise.allSettled(
    webhooks.map(async (wh) => {
      const res = await fetch(wh.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        console.error(`Webhook ${wh.id} failed: ${res.status}`);
      }

      return { webhookId: wh.id, status: res.status };
    })
  );

  return results;
}
