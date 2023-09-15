# grammY API

Broadcasting made easy for grammY users.

# Running

- `git clone git@github.com/roziscoding/grammy-api.git`
- `cd grammy-api`
- `docker compose up`

The API listens on port 3000.

# Endpoints

All endpoints expect a `grammy-token` header to be present, which is the token of your bot. 
All communication is done through JSON (application/json content-type).
All endpoints return an object with `{ "ok": true }` on success.

## POST /setWebhook

Expects a `webhookUrl` string property on the body. Sets that URL as broadcast webhook for your bot. You must call this endpoint at least once before calling any other one.

Example (httpie):

```sh
httpie POST :3000/setWebhook \
grammy-token:298456616:AAFR6AuHgCvYuknZNsvqp724soFrSsPDRBE \
webhookUrl="http://localhost:3030"
```

Response

```json
{
    "ok": true,
    "message": "webhook successfully set for token grammy-token:298456616:AAFR6AuHgCvYuknZNsvqp724soFrSsPDRBE"
}
```

## POST /chatMember

Expects a [`ChatMemberUpdated`](https://core.telegram.org/bots/api#chatmemberupdated) object from the Telegram API. If you use the grammY plugin (comming soon™️) you shouldn't need to call this manually.

## POST /broadcast

Expects a `chatTypes` parameter containing an array of allowed [`Chat`](https://core.telegram.org/bots/api#chat) types that you want to include on the broadcast.
Reads the IDs from the chats stored previously by your bot and queues jobs to call your webhook once per ID.

Example (httpie):

```sh
httpie POST :3000/broadcast \
grammy-token:298456616:AAFR6AuHgCvYuknZNsvqp724soFrSsPDRBE \
'chatTypes[]=group'
```

Response

```json
{
    "ok": true,
    "broadcast": {
        "id": 2,
        "lastFinishedId": 0,
        "status": "idle",
        "lastErrorBody": "",
        "createdAt": "2023-09-15T19:34:07.004Z",
        "startedAt": null,
        "finishedAt": null,
        "botId": 1,
        "ids": 1
    }
}
```

## GET /broadcasts

Returns a list of existing broadcasts for your bot.

Example (httpie)

```sh
httpie :3000/broadcasts \
grammy-token:298456616:AAFR6AuHgCvYuknZNsvqp724soFrSsPDRBE
```

Response:

```json
[
    {
        "id": 1,
        "lastFinishedId": 0,
        "status": "error",
        "lastErrorBody": "TypeError: error sending request for url (http://localhost:3030/): error trying to connect: tcp connect error: Connection refused (os error 111)",
        "createdAt": "2023-09-15T23:19:46.681Z",
        "startedAt": "2023-09-15T23:19:46.737Z",
        "finishedAt": null
    }
]
```