import { db, repositories } from "./db/database.ts";
import { BotRecord } from "./db/schema.ts";
import { oak } from "./deps.ts";
import { errorMiddleware } from "./http/middleware/error.ts";
import { getBotMiddleware } from "./http/middleware/get-bot.ts";
import { validateTokenMiddleware } from "./http/middleware/validate-token.ts";
import { broadcastRoute } from "./http/routes/broadcast.ts";
import { broadcastsRoute } from "./http/routes/broadcasts.ts";
import { chatMembersRoute } from "./http/routes/chat-member.ts";
import { getChatRoute } from "./http/routes/get-chat.ts";
import { setWebhookRoute } from "./http/routes/set-webhook.ts";
import { enqueue } from "./lib/send-message.ts";
import { type Chat, type ChatMember, type User } from "./schemas.ts";

export type AppContext = {
  token: string;
  bot: BotRecord;
  chats: Map<number, Chat>;
  users: Map<number, User>;
  chatMembers: Map<string, ChatMember>;
  webhook: URL;
};

console.log("Resuming broadcasts...");
const broadcasts = await repositories.broadcasts.findResumable();

for (const broadcast of broadcasts) {
  console.log(`Resuming broadcast ${broadcast.id}...`);
  const ids = await repositories.chats.findIdsByTypes(broadcast.botId, broadcast.chatTypes, broadcast.lastFinishedId);
  enqueue(broadcast, ids, broadcast.botWebhook);
}
console.log("Done...");

const app = new oak.Application();

app.use(errorMiddleware);

const router = new oak.Router<AppContext>();
const getBot = getBotMiddleware(repositories);

router.post("/setWebhook", validateTokenMiddleware, setWebhookRoute(repositories));
router.post("/chatMember", getBot, chatMembersRoute(repositories, db));
router.get("/broadcasts", getBot, broadcastsRoute(repositories));
router.post("/broadcast", getBot, broadcastRoute(repositories));
router.get("/chats/:id", getBot, getChatRoute(repositories));

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
