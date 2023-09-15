import { oak } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { TelegramToken } from "../../schemas.ts";

export const validateTokenMiddleware: oak.RouterMiddleware<string, any, AppContext> = async (ctx, next) => {
  const token = await TelegramToken.parseAsync(ctx.request.headers.get("grammy-token"));
  ctx.state.token = token;
  return next();
};
