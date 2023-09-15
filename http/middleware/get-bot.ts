import { Repositories } from "../../db/database.ts";
import { oak } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export const getBotMiddleware =
  (repositories: Repositories): oak.RouterMiddleware<string, any, AppContext> => async (ctx, next) => {
    const token = ctx.request.headers.get("grammy-token");

    if (!token) return oak.createHttpError(oak.Status.Unauthorized, "missing grammy-token header");

    const bot = await repositories.bots.findByToken(token);

    if (!bot) return oak.createHttpError(oak.Status.Unauthorized, "bot is not registered");

    ctx.state.token = token;
    ctx.state.bot = bot;

    return next();
  };
