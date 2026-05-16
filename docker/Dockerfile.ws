FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json turbo.json ./
COPY apps/ws-gateway apps/ws-gateway
COPY libs libs

RUN npm ci
RUN npm run build --filter=@codex/ws-gateway

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 wsgateway

COPY --from=builder /app/apps/ws-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

RUN rm -rf node_modules/@codex && \
    for lib in shared logger; do \
      mkdir -p node_modules/@codex/$lib && \
      printf '{"main":"../../dist/libs/%s/src/index.js"}' "$lib" > node_modules/@codex/$lib/package.json; \
    done

USER wsgateway

EXPOSE 4002

ENV NODE_ENV=production

CMD ["node", "dist/apps/ws-gateway/src/main"]
