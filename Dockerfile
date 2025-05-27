FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Запуск
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# порт из Coolify
ENV PORT=${PORT:-3000}
EXPOSE $PORT

# прогон миграций и запуск
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start -- -p $PORT -H 0.0.0.0"]