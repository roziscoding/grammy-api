import { oak } from "./deps.ts";

const app = new oak.Application();
const router = new oak.Router();

router.post("/", async (ctx) => {
  const body = await ctx.request.body().value;

  console.log(JSON.stringify(body));

  if (body.type === "ping") {
    ctx.response.body = { ok: true };
    return;
  }

  ctx.response.body = { ok: false };
});

app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener("listen", (e) => {
  console.log(`Echo app listening on port ${e.port}`);
});

app.listen({
  port: 80,
});
