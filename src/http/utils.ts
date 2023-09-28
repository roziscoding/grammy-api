import { oak, z } from "../deps.ts";

export const useRequestBody = async <T extends z.ZodTypeAny>(
  schema: T,
  ctx: oak.Context,
): Promise<z.infer<T>> => {
  const rawBody = await ctx.request.body({ type: "json" }).value;
  const body = await schema.parseAsync(rawBody, { path: ["body"] });
  return body;
};
