import { Repositories } from "../../db/database.ts";
import { oak, z } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { useRequestBody } from "../utils.ts";

export const setWebhookRoute =
  (repositories: Repositories): oak.RouterMiddleware<string, any, AppContext> => async (ctx) => {
    const { token } = ctx.state;

    const { webhookUrl } = await useRequestBody(
      z.object({
        webhookUrl: z
          .string()
          .url()
          .transform((value) => new URL(value)),
      }),
      ctx,
    );

    if (webhookUrl.protocol !== "https:" && webhookUrl.protocol !== "http:") {
      throw oak.createHttpError(
        oak.Status.UnprocessableEntity,
        `invalid URL protocol (${webhookUrl.protocol})`,
      );
    }

    await fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify({ type: "ping" }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw oak.createHttpError(
            oak.Status.Unauthorized,
            `invalid webhook response (${response.status}: ${text})`,
          );
        }

        return response.json();
      })
      .then((body) => {
        const { success } = z.object({ ok: z.literal(true) }).safeParse(body);

        if (!success) {
          throw oak.createHttpError(
            oak.Status.Unauthorized,
            `invalid webhook response (${JSON.stringify(body)})`,
          );
        }
      });

    await repositories.bots.insert({ token, webhook: webhookUrl.toString() });

    ctx.response.body = { ok: true, message: `webhook url was set for token ${token}` };
  };
