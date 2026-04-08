# Multi-stage Dockerfile para produção

# Stage 1: Base
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Stage 3: Build
FROM base AS build
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 4: Production
FROM base AS production
WORKDIR /app

# Copiar apenas o necessário
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/src ./src

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bun -u 1001

USER bun

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "src/index.ts"]
