import { Repositories, repositories } from "../db/database.ts";
import { BroadcastRecord } from "../db/schema.ts";
import { oak, q } from "../deps.ts";
import { TooManyRequestsError } from "../schemas.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessage(
  url: string,
  id: number,
  queue: q.Queue,
  broadcastId: number,
  { broadcasts }: Repositories,
  other: { maxRetries?: number; retries?: number } = {},
): Promise<void> {
  try {
    const { retries = 0, maxRetries = 3 } = other;

    if (retries >= maxRetries) {
      queue.stop();
      await broadcasts.updateById(broadcastId, {
        status: "error",
        lastErrorBody: JSON.stringify({ ok: false, message: `reached maximum retries ${maxRetries}` }),
      });
      return;
    }

    await broadcasts.updateById(broadcastId, { status: "running", waitUntil: null });

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ chatId: id }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      await broadcasts.updateById(broadcastId, { lastFinishedId: id });
      return;
    }

    if (response.status !== oak.Status.TooManyRequests) {
      queue.stop();
      await broadcasts.updateById(broadcastId, { status: "error", lastErrorBody: await response.text() });
      return;
    }

    const { parameters: { retry_after: retryAfter } } = TooManyRequestsError.parse(await response.json());

    await broadcasts.updateById(broadcastId, { status: "waiting", waitUntil: new Date(Date.now() + retryAfter) });

    await wait(retryAfter);

    return sendMessage(url, id, queue, broadcastId, repositories, { ...other, retries: retries + 1 });
  } catch (error) {
    queue.stop();
    await broadcasts.updateById(broadcastId, { status: "error", lastErrorBody: error.toString() });
    return;
  }
}

export function enqueue(broadcast: BroadcastRecord, ids: number[], webhook: string) {
  const queue = new q.Queue(false);

  queue.push(() => repositories.broadcasts.markStarted(broadcast.id));

  for (const id of ids) {
    queue.push(() => sendMessage(webhook, id, queue, broadcast.id, repositories, { retries: 0 }));
  }

  queue.push(() => repositories.broadcasts.markFinished(broadcast.id));

  queue.start();
}
