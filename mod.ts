import { db, repositories } from "./db/database.ts";
import { BotRecord } from "./db/schema.ts";
import { oak } from "./deps.ts";
import { errorMiddleware } from "./http/middleware/error.ts";
import { getBotMiddleware } from "./http/middleware/get-bot.ts";
import { validateTokenMiddleware } from "./http/middleware/validate-token.ts";
import { broadcastRoute } from "./http/routes/broadcast.ts";
import { broadcastsRoute } from "./http/routes/broadcasts.ts";
import { chatMembersRoute } from "./http/routes/chat-member.ts";
import { setWebhookRoute } from "./http/routes/set-webhook.ts";
import { type Chat, type ChatMember, type User } from "./schemas.ts";

export type AppContext = {
  token: string;
  bot: BotRecord;
  chats: Map<number, Chat>;
  users: Map<number, User>;
  chatMembers: Map<string, ChatMember>;
  webhook: URL;
};

const app = new oak.Application();

app.use(errorMiddleware);

const router = new oak.Router<AppContext>();

router.post("/setWebhook", validateTokenMiddleware, setWebhookRoute(repositories));
router.post("/chatMember", getBotMiddleware(repositories), chatMembersRoute(repositories, db));
router.get("/broadcasts", getBotMiddleware(repositories), broadcastsRoute(repositories));
router.post("/broadcast", getBotMiddleware(repositories), broadcastRoute(repositories));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", (e) => {
  console.log(`App listening on port ${e.port}`);
});

app.listen({
  port: Number(Deno.env.get("PORT")) || 3000,
});
