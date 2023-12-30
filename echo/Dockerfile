FROM denoland/deno:alpine-1.36.4

WORKDIR /app

# Prefer not to run as root.
USER deno

ADD ./deps.ts ./
RUN deno cache ./deps.ts

ADD ./mod.ts ./

CMD ["run", "-A", "mod.ts"]