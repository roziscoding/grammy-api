import { Repositories } from "../../db/database.ts";
import { Database } from "../../db/schema.ts";
import { Kysely, oak } from "../../deps.ts";
import { AppContext } from "../../mod.ts";
import { ChatMemberUpdated } from "../../schemas.ts";
import { useRequestBody } from "../utils.ts";

export const chatMembersRoute =
  (repositories: Repositories, db: Kysely<Database>): oak.RouterMiddleware<string, any, AppContext> => async (ctx) => {
    const { bot: { id: botId } } = ctx.state;
    const { chat, new_chat_member: newChatMember } = await useRequestBody(ChatMemberUpdated, ctx);

    await db.transaction().execute(async (trx) => {
      await repositories.users.insert({ id: newChatMember.user.id, botId, data: JSON.stringify(newChatMember) }, trx);
      await repositories.chats.insert({ id: chat.id, botId, type: chat.type, data: JSON.stringify(chat) }, trx);
      await repositories.chatMembers.insert({
        botId,
        chatId: chat.id,
        userId: newChatMember.user.id,
        status: newChatMember.status,
        data: JSON.stringify(
          (({ user: _, status: __, ...chatMemberInfo }: typeof newChatMember) => chatMemberInfo)(newChatMember),
        ),
      }, trx);
    });

    ctx.response.body = { ok: true, message: "chatMember registered" };
  };
