# Використовуємо офіційний Node.js образ
FROM node:18-alpine

# Встановлюємо NODE_ENV для production
ENV NODE_ENV=production

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json з правильними правами
COPY --chown=node:node package*.json ./

# Встановлюємо тільки production залежності
RUN npm ci --omit=dev && npm cache clean --force

# Копіюємо вихідний код з правильними правами
COPY --chown=node:node . .

# Використовуємо стандартного node користувача (безпечніше)
USER node

# Відкриваємо порт
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "start"]