import { Repositories } from "../../db/database.ts";
import { oak, z } from "../../deps.ts";
import { enqueue } from "../../lib/send-message.ts";
import { AppContext } from "../../mod.ts";
import { useRequestBody } from "../utils.ts";

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

    const ids = await repositories.chats.findIdsByTypes(ctx.state.bot.id, chatTypes);

    const broadcast = await repositories.broadcasts.insert({
      botId: ctx.state.bot.id,
      lastFinishedId: 0,
      status: "idle",
      lastErrorBody: "",
      chatTypes,
    });

    enqueue(broadcast, ids, ctx.state.webhook.toString());

    ctx.response.status = oak.Status.Accepted;
    ctx.response.body = { ok: true, broadcast: { ...broadcast, ids: ids.length } };
  };
