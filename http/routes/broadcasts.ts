import { Repositories } from "../../db/database.ts";
import { oak } from "../../deps.ts";

export const broadcastsRoute = (repositories: Repositories): oak.Middleware => async (ctx) => {
  const broadcasts = await repositories.broadcasts.findByBotId(ctx.state.bot.id);
  ctx.response.body = broadcasts;
};
