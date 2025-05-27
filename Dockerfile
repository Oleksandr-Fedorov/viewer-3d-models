# 0) Bust the cache on every build
ARG CACHEBUST=1

# 1) Устанавливаем зависимости (с legacy-peer-deps)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 2) Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma клиент ПЕРЕД сборкой
RUN npx prisma generate

RUN npm run build

# 3) Запуск
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Копируем Prisma файлы для миграций
COPY --from=builder /app/prisma ./prisma

# Порт для запуска
ENV PORT=3000
EXPOSE 3000

# Миграции и стартер
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start -- -p $PORT -H 0.0.0.0"]