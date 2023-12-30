import { Repositories } from "../../db/database.ts";
import { oak } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export const getChatRoute =
  (repositories: Repositories): oak.RouterMiddleware<string, { id: string }, AppContext> => async (ctx) => {
    const chat = await repositories.chats.findByBotAndId(ctx.state.bot.id, Number(ctx.params.id));

    if (!chat) {
      throw oak.createHttpError(404, "Chat not found");
    }

    ctx.response.body = chat;
  };
