FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
COPY ../../packages ./packages
COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 8088

CMD ["node", "dist/index.js"]
