FROM denoland/deno:alpine-1.36.4

WORKDIR /app

# Prefer not to run as root.
USER deno

ADD ./src/deps.ts ./src/
ADD deno.jsonc ./
ADD deno.lock ./
RUN deno cache -c ./deno.jsonc ./src/deps.ts

ADD src/ /app/src

CMD ["task", "start"]
