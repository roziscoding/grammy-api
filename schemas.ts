import { grammy, z } from "./deps.ts";

export const User = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.literal(true).optional(),
  added_to_attachment_menu: z.literal(true).optional(),
});

export type User = z.infer<typeof User>;

export const ChatMemberOwner = z.object({
  status: z.literal("creator"),
  user: User,
  is_anonymous: z.boolean(),
  custom_title: z.string().optional(),
});

export const ChatMemberAdministrator = z.object({
  status: z.literal("administrator"),
  user: User,
  can_be_edited: z.boolean(),
  is_anonymous: z.boolean(),
  can_manage_chat: z.boolean(),
  can_delete_messages: z.boolean(),
  can_manage_video_chats: z.boolean(),
  can_restrict_members: z.boolean(),
  can_promote_members: z.boolean(),
  can_change_info: z.boolean(),
  can_invite_users: z.boolean(),
  can_post_messages: z.boolean().optional(),
  can_edit_messages: z.boolean().optional(),
  can_pin_messages: z.boolean().optional(),
  can_manage_topics: z.boolean().optional(),
  custom_title: z.string().optional(),
});

export const ChatMemberMember = z.object({
  status: z.literal("member"),
  user: User,
});

export const ChatMemberRestricted = z.object({
  status: z.literal("restricted"),
  user: User,
  is_member: z.boolean(),
  can_send_messages: z.boolean(),
  can_send_audios: z.boolean(),
  can_send_documents: z.boolean(),
  can_send_photos: z.boolean(),
  can_send_videos: z.boolean(),
  can_send_video_notes: z.boolean(),
  can_send_voice_notes: z.boolean(),
  can_send_polls: z.boolean(),
  can_send_other_messages: z.boolean(),
  can_add_web_page_previews: z.boolean(),
  can_change_info: z.boolean(),
  can_invite_users: z.boolean(),
  can_pin_messages: z.boolean(),
  can_manage_topics: z.boolean(),
  until_date: z.number(),
});

export const ChatMemberLeft = z.object({
  status: z.literal("left"),
  user: User,
});

export const ChatMemberBanned = z.object({
  status: z.literal("kicked"),
  user: User,
  until_date: z.number(),
});

export const ChatMember = z.union([
  ChatMemberOwner,
  ChatMemberAdministrator,
  ChatMemberMember,
  ChatMemberRestricted,
  ChatMemberLeft,
  ChatMemberBanned,
]);

export type ChatMember = z.infer<typeof ChatMember>;

const AbstractChat = z.object({
  id: z.number(),
  type: z.string(),
});

const userNameChatSchema = z.object({
  username: z.string().optional(),
});

const titleChatSchema = z.object({
  title: z.string(),
});

const PrivateChat = AbstractChat
  .extend(userNameChatSchema.shape)
  .extend({
    type: z.literal("private"),
    first_name: z.string(),
    last_name: z.string().optional(),
  });

const GroupChat = AbstractChat
  .extend(titleChatSchema.shape)
  .extend({
    type: z.literal("group"),
  });

const SuperGroupChat = AbstractChat
  .extend(userNameChatSchema.shape)
  .extend(titleChatSchema.shape)
  .extend({
    type: z.literal("supergroup"),
    is_forum: z.literal(true).optional(),
  });

const ChannelChat = AbstractChat
  .extend(userNameChatSchema.shape)
  .extend(titleChatSchema.shape)
  .extend({
    type: z.literal("channel"),
  });

export const Chat = z
  .union([
    PrivateChat,
    GroupChat,
    SuperGroupChat,
    ChannelChat,
  ])
  .and(AbstractChat);

export type Chat = z.infer<typeof Chat>;

export const ChatInviteLink = z.object({
  invite_link: z.string(),
  creator: User,
  creates_join_request: z.boolean(),
  is_primary: z.boolean(),
  is_revoked: z.boolean(),
  name: z.string().optional(),
  expire_date: z.number().optional(),
  member_limit: z.number().optional(),
  pending_join_request_count: z.number().optional(),
});

export const ChatMemberUpdated = z.object({
  chat: Chat,
  from: User,
  date: z.number(),
  old_chat_member: ChatMember,
  new_chat_member: ChatMember,
  via_chat_folder_invite_link: z.boolean().optional(),
});

export const TooManyRequestsError = z.object({
  parameters: z.object({ retry_after: z.number() }),
});

export const TelegramToken = z
  .string()
  .refine(
    (value) =>
      new grammy.Api(value)
        .getMe()
        .then(() => true)
        .catch(() => null),
    "invalid bot token",
  )
  .brand("TELEGRAM_TOKEN");

export type TelegramToken = z.infer<typeof TelegramToken>;
