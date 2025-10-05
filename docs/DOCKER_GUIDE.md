# 🐳 Docker Guide - GoIT Node.js REST API

Гайд по запуску додатку в Docker.

---

## 📋 Зміст

- [Швидкий старт](#-швидкий-старт)
- [Детальна інструкція](#-детальна-інструкція)
- [Docker Compose](#-docker-compose)
- [Налаштування середовища](#-налаштування-середовища)
- [Моніторинг та логи](#-моніторинг-та-логи)
- [Troubleshooting](#-troubleshooting)
- [Production deployment](#-production-deployment)

---

## 🚀 Швидкий старт

### ⚠️ ПОПЕРЕДЖЕННЯ ПРО БЕЗПЕКУ

**НІКОЛИ НЕ КОМІТЬТЕ .env ФАЙЛИ З РЕАЛЬНИМИ СЕКРЕТАМИ!**

- Використовуйте тільки `.example` файли в git
- Створюйте локальні `.env` файли з реальними даними
- Додайте `.env.*` до `.gitignore`

### Варіант 1: Тільки API (з зовнішньою БД)

```bash
# 1. Клонуйте репозиторій
git clone https://github.com/andriy-pro/goit-node-rest-api.git
cd goit-node-rest-api

# 2. Налаштуйте .env файл
# ⚠️ Використовуйте приклади, НЕ комітьте реальні секрети!
cp .env.docker.example .env.docker
# Відредагуйте .env.docker з вашими РЕАЛЬНИМИ налаштуваннями

# 3. Зберіть та запустіть контейнер
npm run docker:up
npm run docker:run
```

### Варіант 2: Повний стек (API + PostgreSQL)

```bash
# 1. Клонуйте репозиторій
git clone https://github.com/andriy-pro/goit-node-rest-api.git
cd goit-node-rest-api

# 2. Налаштуйте .env.docker файл
cp .env.docker.example .env.docker
# Відредагуйте .env.docker з вашими налаштуваннями

# 3. Запустіть весь стек
docker-compose up -d
```

---

## 📖 Детальна інструкція

### Крок 1: Підготовка

#### Встановіть Docker

- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** [Docker Engine](https://docs.docker.com/engine/install/)

#### Перевірте встановлення

```bash
docker --version
docker-compose --version
```

### Крок 2: Налаштування середовища

#### Створіть .env файл

```bash
# ⚠️ Ще раз: Ніколи не комітьте .env файли з реальними секретами!
cp .env.docker.example .env.docker
# Або для тестування:
# cp .env.test.example .env.test
```

#### Відредагуйте .env файл

```env
# Environment
NODE_ENV=production

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Database Configuration (для Docker Compose)
DB_HOST=postgres
DB_NAME=db-contacts
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_PORT=5432
DB_SSL=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-64-characters-long-for-production

# Email Configuration
UKR_NET_EMAIL=your_email@ukr.net
UKR_NET_PASSWORD=your_app_password
BASE_URL=http://localhost:3000
```

### Крок 3: Збірка образу

```bash
# Збірка образу
docker build -t goit-node-rest-api .

# Перевірка образу
docker images | grep goit-node-rest-api
```

### Крок 4: Запуск контейнера

#### Простий запуск

```bash
docker run -p 3000:3000 --env-file .env goit-node-rest-api
```

#### Запуск у фоновому режимі

```bash
docker run -d -p 3000:3000 --env-file .env --name goit-api goit-node-rest-api
```

#### Зупинка контейнера

```bash
docker stop goit-api
docker rm goit-api
```

---

## 🐙 Docker Compose

### Переваги Docker Compose

- ✅ Автоматичне підняття PostgreSQL
- ✅ Налаштована мережа між сервісами
- ✅ Збереження даних БД
- ✅ Adminer для управління БД

### Команди Docker Compose

#### Запуск всіх сервісів

```bash
# Запуск у фоновому режимі
docker-compose up -d

# Запуск з логами
docker-compose up
```

#### Перезбірка та запуск

```bash
docker-compose up --build -d
```

#### Зупинка сервісів

```bash
# Зупинка без видалення
docker-compose stop

# Зупинка з видаленням контейнерів
docker-compose down

# Зупинка з видаленням volumes (⚠️ ВИДАЛИТЬ ДАНІ БД!)
docker-compose down -v
```

#### Перегляд статусу

```bash
docker-compose ps
```

### Доступ до сервісів

| Сервіс | URL | Опис |
|--------|-----|------|
| API | <http://localhost:3000> | REST API |
| PostgreSQL | localhost:5432 | База даних |
| Adminer | <http://localhost:8080> | Веб-інтерфейс БД |

#### Підключення до Adminer

- **Сервер:** `postgres`
- **Користувач:** значення з `DB_USER`
- **Пароль:** значення з `DB_PASSWORD`
- **База даних:** значення з `DB_NAME`

---

## ⚙️ Налаштування середовища

### Змінні середовища для Docker

#### Обов'язкові змінні

```env
NODE_ENV=production
DB_HOST=postgres          # Для Docker Compose
DB_NAME=db-contacts
DB_USER=postgres
DB_PASSWORD=secure_password
JWT_SECRET=your-64-char-secret
```

#### Опціональні змінні

```env
PORT=3000
HOST=0.0.0.0
BASE_URL=http://localhost:3000
UKR_NET_EMAIL=your@ukr.net
UKR_NET_PASSWORD=app_password
```

### Різниця між .env файлами

- **`.env.example`** - загальний приклад для всіх середовищ
- **`.env.docker.example`** - спеціально для Docker Compose
- **`.env.test.example`** - для тестування

### Налаштування для різних середовищ

#### Development (Docker)

```env
NODE_ENV=development
DB_HOST=postgres         # Docker service name
```

#### Production (Docker)

```env
NODE_ENV=production
DB_HOST=postgres         # Docker service name
BASE_URL=https://yourdomain.com
DB_SSL=false            # Docker PostgreSQL без SSL
```

---

## 📊 Моніторинг та логи

### Перегляд логів

#### Docker run

```bash
# Логи контейнера
docker logs goit-api

# Логи в реальному часі
docker logs -f goit-api
```

#### Docker Compose

```bash
# Логи всіх сервісів
docker-compose logs

# Логи конкретного сервісу
docker-compose logs api

# Логи в реальному часі
docker-compose logs -f api
```

### Моніторинг ресурсів

```bash
# Статистика контейнерів
docker stats

# Інформація про контейнер
docker inspect goit-api
```

### Підключення до контейнера

```bash
# Підключення до запущеного контейнера
docker exec -it goit-api sh

# Запуск команд в контейнері
docker exec goit-api npm run seed
```

---

## 🔧 Troubleshooting

### Проблема: Контейнер не запускається

**Симптоми:**

```
Error: Cannot find module 'express'
```

**Рішення:**

```bash
# Перезберіть образ
docker build --no-cache -t goit-node-rest-api .
```

### Проблема: Не можу підключитися до БД

**Симптоми:**

```
Database connection error: connect ECONNREFUSED
```

**Рішення:**

1. Перевірте що PostgreSQL запущений:

```bash
docker-compose ps postgres
```

2. Перевірте налаштування в .env:

```env
DB_HOST=postgres  # Для Docker Compose
DB_HOST=localhost # Для зовнішньої БД
```

### Проблема: Порт зайнятий

**Симптоми:**

```
Error: Port 3000 is already in use
```

**Рішення:**

```bash
# Знайдіть процес що використовує порт
lsof -i :3000

# Або змініть порт в docker-compose.yml
ports:
  - "3001:3000"  # Зовнішній порт 3001
```

### Проблема: Дані БД втрачені

**Рішення:**

```bash
# Перевірте volumes
docker volume ls

# Відновіть з бекапу
docker exec -i postgres_container psql -U postgres -d db-contacts < backup.sql
```

### Проблема: Email не відправляється

**Рішення:**

1. Перевірте налаштування ukr.net в .env
2. Переконайтеся що використовуєте app password
3. Перевірте логи:

```bash
docker-compose logs api | grep -i email
```

---

## 🚀 Production Deployment

### Підготовка до production

#### 1. Оптимізація Dockerfile

```dockerfile
# Multi-stage build для зменшення розміру
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Налаштування змінних середовища

```env
NODE_ENV=production
DB_SSL=true
BASE_URL=https://yourdomain.com
JWT_SECRET=super-long-random-string-64-chars-minimum-for-production
```

#### 3. Налаштування reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Deployment команди

```bash
# 1. Клонування на сервер
git clone <repository-url>
cd goit-node-rest-api

# 2. Налаштування production .env.docker
cp .env.docker.example .env.docker
# Відредагуйте з production налаштуваннями

# 3. Запуск в production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Перевірка здоров'я
curl http://localhost:3000/api/auth/current
```

### Backup та відновлення

#### Створення backup

```bash
# Backup БД
docker exec postgres_container pg_dump -U postgres db-contacts > backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v goit-node-rest-api_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

#### Відновлення з backup

```bash
# Відновлення БД
docker exec -i postgres_container psql -U postgres -d db-contacts < backup_20241205.sql

# Відновлення volumes
docker run --rm -v goit-node-rest-api_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 🔒 Правила безпеки

1. **НІКОЛИ не комітьте файли з реальними секретами:**
   - `.env`
   - `.env.local`
   - `.env.docker`
   - `.env.test`
   - Будь-які файли з реальними паролями/токенами

2. **Використовуйте тільки `.example` файли в git:**
   - `.env.example`
   - `.env.docker.example`
   - `.env.test.example`

3. **Генеруйте нові секрети для production:**

   ```bash
   # Генерація JWT секрета
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Генерація паролів
   openssl rand -base64 32
   ```

4. **Перевіряйте .gitignore:**

   ```bash
   # Переконайтеся що ці файли ігноруються
   git check-ignore .env
   git check-ignore .env.docker
   git check-ignore .env.test
   ```

### 🚨 Якщо ви вже закомітили секрети

1. **Негайно змініть всі паролі та токени**
2. **Видаліть файли з git історії:**

   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env.docker .env.test .env.docker.local' \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Форсовано пушніть зміни:**

   ```bash
   git push origin --force --all
   ```

---

## 📚 Корисні команди

### Docker

```bash
# Очистка системи
docker system prune -a

# Видалення всіх контейнерів
docker rm $(docker ps -aq)

# Видалення всіх образів
docker rmi $(docker images -q)
```

### Docker Compose

```bash
# Перезапуск сервісу
docker-compose restart api

# Масштабування (якщо потрібно)
docker-compose up --scale api=3

# Оновлення образів
docker-compose pull
```

### Налагодження

```bash
# Перевірка мережі
docker network ls
docker network inspect goit-node-rest-api_goit-network

# Перевірка volumes
docker volume ls
docker volume inspect goit-node-rest-api_postgres_data
```

---

**Успішного деплою! 🚀**
