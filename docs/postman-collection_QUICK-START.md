# ⚡ Швидкий старт - GoIT Node.js REST API

Короткий гайд для запуску та тестування REST API з функціоналом авторизації,
контактів та аватарів (Topic 7 & Topic 9).

---

## 🚀 Запуск проєкту

### 1. Підготовка середовища

```bash
# Перейдіть у директорію проєкту
cd /path/to/goit-node-rest-api

# Встановіть залежності
npm install
```

### 2. Налаштування бази даних (опційно)

Створіть файл `.env` у корені проєкту (або використовуйте значення за
замовчуванням):

```env
# JWT
JWT_SECRET=your-secret-key

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=contacts_db
DB_USER=postgres
DB_PASSWORD=your-password

# Server
PORT=3000
```

### 3. Заповнення тестовими даними (рекомендовано)

```bash
npm run seed
```

**Що створює seed (за замовчуванням):**

- **21 користувач** (включаючи "основний тестовий акаунт": mail@andriy.pro,
  пароль: `goit2025`)
- **30 контактів** для кожного користувача
- **Загалом 630 контактів** для тестування пагінації

### 4. Запуск сервера

```bash
# Development режим (з nodemon)
npm run dev

# Production режим
npm start
```

Сервер буде доступний на `http://localhost:3000`

---

## 📮 Тестування в Postman

### Крок 1: Імпорт колекцій

Імпортуйте в Postman одну з колекцій:

| Колекція    | Файл                                   | Опис                                 |
| ----------- | -------------------------------------- | ------------------------------------ |
| **Topic 7** | `docs/postman-collection_topic-7.json` | Базовий функціонал (auth + contacts) |
| **Topic 9** | `docs/postman-collection_topic-9.json` | Розширений функціонал (+ аватари)    |

**В Postman:**

1. Натисніть **Import** (вгорі зліва)
2. Перетягніть JSON файл або натисніть **Upload Files**
3. Натисніть **Import**

### Крок 2: Створення Environment

Створіть Environment у Postman з назвою `GoIT REST API`:

**В Postman:**

1. Натисніть ⚙️ (Manage Environments)
2. **Add** → Назва: `GoIT REST API`
3. Додайте змінну `baseUrl` зі значенням `http://localhost:3000`
4. Інші змінні залиште порожніми - вони заповнюються автоматично

### Крок 3: Тестування

Оберіть один з варіантів:

#### 🅰️ Варіант A: Існуючий користувач (після seed)

**Колекція:** Topic 7 або Topic 9

1. **Логін:**

   - Відкрийте запит `🔑 Логін (зберігає токен)` або `🔑 Вхід користувача`
   - Body вже налаштовано:
     ```json
     {
       "email": "mail@andriy.pro",
       "password": "goit2025"
     }
     ```
   - Натисніть **Send**
   - ✅ Токен автоматично збережеться в Environment

2. **Перевірка контактів:**

   - Запустіть `📄 Отримати всі контакти`
   - ✅ Побачите 30 контактів користувача
   - Перший контакт: **Vladyslav Apelhants** (у фаворитах)

3. **Тестування пагінації:**
   - `GET /api/contacts?page=1&limit=10` - перші 10 контактів
   - `GET /api/contacts?page=2&limit=10` - наступні 10
   - `GET /api/contacts?favorite=true` - тільки улюблені

#### 🅱️ Варіант B: Новий користувач (Topic 9)

**Колекція:** Topic 9 (з аватарами)

1. **Реєстрація:**

   - Запустіть `📝 Реєстрація (генерує Gravatar)`
   - ✅ Унікальний email згенерується автоматично
   - ✅ Gravatar URL створюється і зберігається в БД

2. **Логін:**

   - Запустіть `🔑 Логін (зберігає токен)`
   - ✅ Токен автоматично збережеться

3. **Перевірка користувача:**

   - Запустіть `✅ GET Current User (з токеном)`
   - ✅ Отримаєте `{ email, subscription }`

4. **Завантаження аватара:**

   - Відкрийте запит `⬆️ Оновити аватар (PATCH /api/auth/avatars)`
   - Перейдіть на вкладку **Body** → **form-data**
   - Знайдіть поле `avatar` (type = File)
   - ⚠️ **ВАЖЛИВО:** Натисніть **Select Files**
   - Оберіть файл: `public/avatars/test-avatar.png`
   - Натисніть **Send**
   - ✅ Отримаєте `{ avatarURL: "/avatars/user-X-nanoid.png" }`

Для запиту `🔄 Оновити аватар повторно (тест заміни)` порядок дій аналогічний.
Обидва запити мають тестуватись **ВРУЧНУ** !

5. **Перевірка аватара:**
   - Запустіть `🌐 Перевірити доступність аватара (HEAD)`
   - Запустіть `🖼️ Відкрити аватар (GET)`
   - ✅ Аватар доступний через статику

---

## 🧪 Автоматизовані тести

### Запуск тестів

```bash
# Всі тести (Jest)
npm test

# Тести з покриттям коду
npm run test:coverage

# Лінтинг (ESLint)
npm run lint
```

### Очікувані результати

```
Test Suites: 14 passed, 14 total
Tests:       146 passed, 146 total
Snapshots:   0 total
Time:        ~90s
```

**Що тестується:**

- 17 unit-тестів для login контролера
- 131 integration тестів (auth, contacts, subscription)
- Валідація всіх ендпоїнтів
- Перевірка структури відповідей

---

## 🔧 Швидкі CLI команди для тестування

### Після запуску сервера (`npm run dev`):

```bash
# Реєстрація нового користувача
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Логін
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Відповідь: { "token": "...", "user": {...} }

# Збережіть токен у змінну:
TOKEN="your-token-from-login-response"

# Поточний користувач
curl -X GET http://localhost:3000/api/auth/current \
  -H "Authorization: Bearer $TOKEN"

# Отримати всі контакти
curl -X GET http://localhost:3000/api/auth/current \
  -H "Authorization: Bearer $TOKEN"

# Створити контакт
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"+380991234567"}'

# Пагінація
curl -X GET "http://localhost:3000/api/contacts?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Фільтрація улюблених
curl -X GET "http://localhost:3000/api/contacts?favorite=true" \
  -H "Authorization: Bearer $TOKEN"

# Завантаження аватара
curl -X PATCH http://localhost:3000/api/auth/avatars \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@public/avatars/test-avatar.png"
# Відповідь: { "avatarURL": "/avatars/user-X-nanoid.png" }

# Перевірка статичного файлу (аватар)
curl -I http://localhost:3000/avatars/user-X-nanoid.png
# Очікується: 200 OK, Content-Type: image/png
```

---

## ⚠️ Вирішення проблем

### 🔴 "Порожній масив контактів `[]`"

**Причина:** Новий користувач не має контактів.

**Рішення:**

1. Виконайте `npm run seed` для створення тестових даних
2. АБО увійдіть як `mail@andriy.pro` / `goit2025`
3. АБО створіть контакти через API (POST /api/contacts)

### 🔴 "401 Unauthorized"

**Причина:** Відсутній або неправильний JWT токен.

**Рішення:**

1. Виконайте логін: `POST /api/auth/login`
2. Скопіюйте `token` з відповіді
3. Додайте заголовок: `Authorization: Bearer YOUR_TOKEN`
4. В Postman перевірте що токен збережено в Environment

### 🔴 "Avatar file is required (400)"

**Причина:** У Postman не обрано файл для завантаження.

**Рішення:**

1. Відкрийте запит `⬆️ Оновити аватар` в Postman UI
2. Вкладка **Body** → **form-data**
3. Поле `avatar` → тип **File**
4. Натисніть **Select Files**
5. Оберіть файл: `public/avatars/test-avatar.png` з вашої файлової системи
6. Натисніть **Send**

**Примітка:** Collection Runner НЕ підтримує автоматичне прикріплення файлів -
тільки ручний запуск!

### 🔴 "Database connection error"

**Причина:** PostgreSQL не запущений або неправильні налаштування.

**Рішення:**

1. Запустіть PostgreSQL:

   ```bash
   # Локально
   sudo service postgresql start

   # Або в Docker
   docker run -d \
     --name postgres \
     -e POSTGRES_PASSWORD=your-password \
     -e POSTGRES_DB=contacts_db \
     -p 5432:5432 \
     postgres:latest
   ```

2. Перевірте змінні середовища в `.env`:
   - `DB_HOST`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
3. Перевірте підключення:
   ```bash
   psql -h localhost -U postgres -d contacts_db
   ```

### 🔴 "EADDRINUSE: address already in use"

**Причина:** Порт 3000 вже зайнятий іншим процесом.

**Рішення:**

```bash
# Знайти процес
lsof -i :3000
# або
netstat -tuln | grep 3000

# Зупинити процес
kill -9 PID

# Або змініть PORT у .env
echo "PORT=3001" >> .env
```

---

## 📚 Додаткові ресурси

### Документація проєкту

| Файл                                                                | Опис                                |
| ------------------------------------------------------------------- | ----------------------------------- |
| [README.md](../README.md)                                           | Основне технічне завдання (Topic 9) |
| [Seed README](../src/db/seeders/README.md)                          | Документація тестових даних         |
| [Verification Guide](../.mdf/project/verification_guide_topic-9.md) | Покроковий гайд перевірки           |
| [Postman Guide (Topic 9)](../.mdf/project/POSTMAN_GUIDE_topic-9.md) | Детальна інструкція для Postman     |

### API Endpoints

| Метод  | Endpoint                     | Опис                                 |
| ------ | ---------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`         | Реєстрація нового користувача        |
| POST   | `/api/auth/login`            | Логін (отримання JWT)                |
| GET    | `/api/auth/current`          | Поточний користувач (потрібен токен) |
| POST   | `/api/auth/logout`           | Вихід (видалення токену)             |
| PATCH  | `/api/auth/subscription`     | Оновлення підписки                   |
| PATCH  | `/api/auth/avatars`          | Завантаження аватара (Topic 9)       |
| GET    | `/api/contacts`              | Список контактів (з пагінацією)      |
| POST   | `/api/contacts`              | Створення контакту                   |
| GET    | `/api/contacts/:id`          | Отримання контакту по ID             |
| PUT    | `/api/contacts/:id`          | Оновлення контакту                   |
| DELETE | `/api/contacts/:id`          | Видалення контакту                   |
| PATCH  | `/api/contacts/:id/favorite` | Зміна статусу "улюблений"            |
