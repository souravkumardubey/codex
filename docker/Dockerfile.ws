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

COPY --from=builder /app/dist/apps/ws-gateway ./dist
COPY --from=builder /app/apps/ws-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules

USER wsgateway

EXPOSE 4002

ENV NODE_ENV=production

CMD ["node", "dist/src/main"]
