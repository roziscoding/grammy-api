import { oak, z } from "../../deps.ts";
import { AppContext } from "../../mod.ts";

export async function errorMiddleware(ctx: oak.Context<AppContext>, next: () => Promise<unknown>) {
  try {
    await next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      ctx.response.status = 422;
      ctx.response.body = {
        ok: false,
        status: 422,
        code: "unprocessable_entity",
        errors: err.issues.map((issue) =>
          issue.path.findLast(() => true) === "token" ? { ...issue, code: "invalid_telegram_token" } : issue
        ),
      };
      return ctx;
    }

    if (err instanceof oak.HttpError) {
      ctx.response.status = err.status;
      ctx.response.body = {
        ok: false,
        status: err.status,
        code: err.cause ||
          err.name.replace(
            /[A-Z]/g,
            (letter, index) => index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`,
          ),
        message: err.message,
        stack: err.expose ? err.stack : undefined,
      };

      return ctx;
    }

    console.error(err);

    ctx.response.status = 500;
    ctx.response.body = {
      ok: false,
      status: 500,
      code: "internal_server_error",
    };
  }
}
