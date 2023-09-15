import { Repositories, repositories } from "../../db/database.ts";
import { oak, q, z } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { TooManyRequestsError } from "../../schemas.ts";
import { useRequestBody } from "../utils.ts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendMessage(
  url: string,
  id: number,
  queue: q.Queue,
  broadcastId: number,
  { broadcasts }: Repositories,
  other: { maxRetries?: number; retries?: number } = {},
): Promise<void> {
  const { retries = 0, maxRetries = 3 } = other;

  if (retries >= maxRetries) {
    queue.stop();
    await broadcasts.updateById(broadcastId, {
      status: "error",
      lastErrorBody: JSON.stringify({ ok: false, message: `reached maximum retries ${maxRetries}` }),
    });
    return;
  }

  await broadcasts.updateById(broadcastId, { status: "running" });

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

  await broadcasts.updateById(broadcastId, { status: "waiting" });

  const { parameters: { retry_after: retryAfter } } = TooManyRequestsError.parse(await response.json());

  await wait(retryAfter);

  return sendMessage(url, id, queue, broadcastId, repositories, { ...other, retries: retries + 1 });
}

export const broadcastRoute =
  (repositories: Repositories): oak.RouterMiddleware<string, any, AppContext> => async (ctx) => {
    const { chatTypes } = await useRequestBody(
      z.object({
        chatTypes: z.array(z.enum(["private", "group", "supergroup", "channel"])).min(1).default([
          "group",
          "supergroup",
          "channel",
        ]),
      }),
      ctx,
    );

    const ids = await repositories.chats.findIdsByTypes(chatTypes);

    const broadcast = await repositories.broadcasts.insert({
      botId: ctx.state.bot.id,
      lastFinishedId: 0,
      status: "idle",
      lastErrorBody: "",
    });

    const queue = new q.Queue(false);

    queue.push(() => repositories.broadcasts.markStarted(broadcast.id));

    for (const id of ids) {
      queue.push(() => sendMessage(ctx.state.bot.webhook, id, queue, broadcast.id, repositories, { retries: 0 }));
    }

    queue.push(() => repositories.broadcasts.markFinished(broadcast.id));

    queue.start();

    ctx.response.status = oak.Status.Accepted;
    ctx.response.body = { ok: true, broadcast: { ...broadcast, ids: ids.length } };
  };
