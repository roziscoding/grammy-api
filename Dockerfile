FROM denoland/deno:alpine-1.36.4

WORKDIR /app

# Prefer not to run as root.
USER deno

ADD ./deps.ts .
ADD ./deno.jsonc .
ADD ./deno.lock .

ADD db/ /app/db
ADD http/ /app/http
ADD mod.ts schemas.ts config.ts ./

RUN deno cache deps.ts

CMD ["task", "start"]
