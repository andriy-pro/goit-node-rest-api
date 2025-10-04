# 📮 Postman Колекція - Topic 9: Files & Testing

Повна інструкція з використання Postman колекції для тестування функціоналу аватарів та автентифікації.

---

## 📥 Імпорт колекції

### Крок 1: Імпортуйте колекцію в Postman

```bash
Файл: docs/postman-collection_topic-9.json
```

**В Postman:**
1. Натисніть **Import** (вгорі зліва)
2. Перетягніть файл `postman-collection_topic-9.json` або оберіть через **Upload Files**
3. Натисніть **Import**

### Крок 2: Налаштуйте змінні колекції (опціонально)

Колекція вже має налаштовані змінні:

| Змінна | Значення за замовчуванням | Опис |
|--------|---------------------------|------|
| `baseUrl` | `http://localhost:3000` | URL вашого API |
| `authToken` | _(автоматично)_ | JWT токен після логіну |
| `uniqueEmail` | _(автоматично)_ | Email для тестів |
| `avatarURL` | _(автоматично)_ | URL аватара після завантаження |

**Якщо ваш сервер запущено на іншому порті:**
1. Клік правою кнопкою на колекції → **Edit**
2. Вкладка **Variables**
3. Змініть `baseUrl` (наприклад, `http://localhost:8080`)

---

## 🚀 Запуск колекції

### ⚠️ ВАЖЛИВО: Підготовка файлу для завантаження

Перед запуском переконайтеся що файл `test-avatar.png` існує:

```bash
# Перевірте наявність файлу
ls -la public/avatars/test-avatar.png

# Якщо файлу немає - створіть тестове зображення або скопіюйте будь-яке
```

---

## 📋 Послідовність тестування

### Варіант 1: Покрокове виконання (рекомендовано для налагодження)

#### 1️⃣ Підготовка (обов'язково спочатку!)

**📝 Реєстрація:**
```
POST /api/auth/register
```
- Генерує унікальний email
- Створює користувача з Gravatar URL (зберігається в БД)
- ✅ Перевіряє що response НЕ містить `avatarURL`

**🔑 Логін:**
```
POST /api/auth/login
```
- Логінить створеного користувача
- Зберігає JWT токен в змінну `authToken`
- ✅ Перевіряє структуру відповіді (token + user)

#### 2️⃣ Поточний користувач

**✅ GET Current User (з токеном):**
```
GET /api/auth/current
Authorization: Bearer {{authToken}}
```
- ✅ Повертає ТІЛЬКИ `email` і `subscription`
- ✅ НЕ містить `avatarURL`, `password`, `token`

**❌ GET Current User (без токена):**
```
GET /api/auth/current
```
- ✅ Повертає 401 Unauthorized

#### 3️⃣ Аватари

**⬆️ Оновити аватар:**

⚠️ **КРИТИЧНО ВАЖЛИВО:**

```
PATCH /api/auth/avatars
Authorization: Bearer {{authToken}}
Content-Type: multipart/form-data
```

**ПЕРЕД ЗАПУСКОМ ЦЬОГО ЗАПИТУ:**

1. Відкрийте запит в Postman
2. Перейдіть на вкладку **Body**
3. Переконайтеся що обрано **form-data**
4. Знайдіть поле `avatar` (має тип `File`)
5. **Натисніть "Select Files"** праворуч від поля
6. **Оберіть файл** `public/avatars/test-avatar.png` з вашої файлової системи
7. Підтвердіть вибір
8. Тепер запустіть запит (Send)

**Що відбувається:**
- Файл завантажується → `temp/avatar-{timestamp}.{ext}`
- Обробляється → `public/avatars/user-{userId}-{nanoid}.{ext}`
- БД оновлюється → `avatarURL: /avatars/user-{userId}-{nanoid}.{ext}`
- Старий аватар видаляється (якщо не Gravatar)
- ✅ Повертає `{ avatarURL: "/avatars/..." }`

**🔄 Оновити аватар повторно:**
- Той самий запит, але оберіть файл знову
- ✅ Перевіряє що новий `avatarURL` відрізняється від старого
- ✅ Старий файл має бути видалений

**🌐 Перевірити доступність:**
```
HEAD {{baseUrl}}{{avatarURL}}
```
- ✅ Статика доступна через Express

**🖼️ Відкрити аватар:**
```
GET {{baseUrl}}{{avatarURL}}
```
- Завантажує зображення
- Можна відкрити в браузері

**❌ Помилкові сценарії:**
- Без токена → 401
- Без файлу → 400

---

### Варіант 2: Collection Runner (автоматизований запуск)

⚠️ **ОБМЕЖЕННЯ:** Collection Runner НЕ МОЖЕ автоматично прикріпити файли!

**Тільки для запитів БЕЗ файлів:**

1. Клік правою кнопкою на колекції → **Run collection**
2. Виберіть запити для запуску (виключіть запити з файлами)
3. Натисніть **Run**

**Для повного тестування з файлами:**
- Запускайте запити вручну, прикріплюючи файли як описано вище

---

## 🐛 Вирішення проблем

### ❌ "Avatar file is required" (400)

**Проблема:** Файл не прикріплений до запиту

**Рішення:**
1. Відкрийте запит `PATCH /api/auth/avatars`
2. Body → form-data
3. Поле `avatar` → **Select Files**
4. Оберіть файл з вашої файлової системи
5. Переконайтеся що файл з'явився в Postman UI
6. Запустіть запит

### ❌ "Not authorized" (401)

**Проблема:** Токен відсутній або невалідний

**Рішення:**
1. Запустіть спочатку `📝 Реєстрація`
2. Потім `🔑 Логін` (зберігає токен)
3. Переконайтеся що `{{authToken}}` має значення:
   - Колекція → Variables → `authToken` (має бути непорожнім)
4. Повторіть запит

### ❌ Файл не існує

**Проблема:** `public/avatars/test-avatar.png` відсутній

**Рішення:**
```bash
# Перевірте
ls -la public/avatars/test-avatar.png

# Створіть тестове зображення (будь-який PNG/JPG файл)
# або скопіюйте існуюче зображення:
cp /path/to/any/image.png public/avatars/test-avatar.png
```

### ❌ Сервер не відповідає

**Проблема:** `baseUrl` невірний або сервер не запущений

**Рішення:**
```bash
# Запустіть сервер
npm run dev

# Або перевірте логи
# Server is running on port: 3000

# Переконайтеся що baseUrl правильний
# Postman → Колекція → Edit → Variables → baseUrl
```

---

## ✅ Очікувані результати

### Успішний прохід всіх тестів:

```
✅ 📝 Реєстрація (генерує Gravatar)
  ✅ Status 201 Created
  ✅ Response має user object
  ✅ User має email та subscription
  ❌ Response НЕ містить password
  ❌ Response НЕ містить token
  ❌ Response НЕ містить avatarURL
  ✅ User має рівно 2 поля (email, subscription)

✅ 🔑 Логін (зберігає токен)
  ✅ Status 200 OK
  ✅ Response має token
  ✅ Response має user object
  ✅ User має рівно 2 поля (email, subscription)
  ❌ Response НЕ містить avatarURL

✅ 👤 GET Current User (з токеном)
  ✅ Status 200 OK
  ✅ Response має email та subscription
  ✅ Response має рівно 2 поля
  ❌ Response НЕ містить avatarURL
  ❌ Response НЕ містить password
  ❌ Response НЕ містить token

✅ ❌ GET Current User (без токена) → 401
  ✅ Status 401 Unauthorized
  ✅ Response має повідомлення про помилку

✅ ⬆️ Оновити аватар (PATCH /api/auth/avatars)
  ✅ Status 200 OK
  ✅ Response має avatarURL
  ✅ avatarURL починається з /avatars/
  ✅ avatarURL містить розширення файлу

✅ 🔄 Оновити аватар повторно
  ✅ Status 200 OK
  ✅ Response має новий avatarURL
  ✅ Новий avatarURL відрізняється від старого

✅ 🌐 Перевірити доступність аватара (HEAD)
  ✅ Status 200 OK
  ✅ Content-Type є image

✅ 🖼️ Відкрити аватар (GET)
  ✅ Status 200 OK
  ✅ Response є зображенням

✅ ❌ Оновити аватар без токена → 401
  ✅ Status 401 Unauthorized
  ✅ Response має повідомлення про помилку

✅ ❌ Оновити аватар без файлу → 400
  ✅ Status 400 Bad Request
  ✅ Response має повідомлення про відсутність файлу
```

**Загалом:** 40+ тестів, всі повинні пройти ✅

---

## 📊 Що перевіряє колекція

### ✅ Функціональність (згідно з завданням Topic 9)

1. **Реєстрація:**
   - Gravatar URL генерується автоматично
   - avatarURL зберігається в БД
   - avatarURL НЕ повертається в response

2. **Логін:**
   - Повертає token + user (email, subscription)
   - avatarURL НЕ повертається в response

3. **Current user:**
   - Повертає ТІЛЬКИ email і subscription
   - avatarURL НЕ повертається

4. **Завантаження аватара:**
   - Файл → temp → public/avatars
   - Унікальне ім'я: `user-{id}-{nanoid}.{ext}`
   - Повертає `{ avatarURL: "/avatars/..." }`
   - Аватар доступний через статику

5. **Оновлення аватара:**
   - Старий файл видаляється
   - Новий URL генерується
   - Gravatar не видаляється (зовнішній URL)

### ✅ Безпека

- 401 без токена
- 400 без файлу
- Валідація типів файлів (через Multer в коді)

### ✅ Структура відповідей

- Точна відповідність тестам (2 поля: email, subscription)
- Відсутність sensitive fields (password, token в непотрібних місцях)

---

## 🎯 Поради

### Для швидкого тестування:

1. **Збережіть environment:**
   - Створіть Environment в Postman: "Local Development"
   - Додайте змінні: `baseUrl`, `authToken`, тощо
   - Легше перемикатися між середовищами

2. **Використовуйте Pre-request Scripts:**
   - Колекція вже має скрипти для генерації унікальних email
   - Токен зберігається автоматично

3. **Перегляньте Console:**
   - View → Show Postman Console (Alt+Ctrl+C)
   - Там логи з тестів: `console.log(...)` output

4. **Експортуйте результати:**
   - Collection Runner → Run → Export Results
   - Збережіть JSON звіт для документації

---

## 📚 Додаткові ресурси

- [Postman: Working with files](https://learning.postman.com/docs/sending-requests/supported-api-frameworks/working-with-files/)
- [Postman: Variables](https://learning.postman.com/docs/sending-requests/variables/)
- [Postman: Scripts](https://learning.postman.com/docs/writing-scripts/intro-to-scripts/)

---

## ✅ Checklist перед здачею

- [ ] Сервер запущено: `npm run dev`
- [ ] База даних підключена: `Database connection successful`
- [ ] Файл `public/avatars/test-avatar.png` існує
- [ ] Тека `temp/` існує
- [ ] Колекція імпортована в Postman
- [ ] Змінна `baseUrl` налаштована правильно
- [ ] Всі запити з теки "🧰 Підготовка" виконані успішно
- [ ] Файл прикріплений до запиту "⬆️ Оновити аватар"
- [ ] Всі тести пройшли ✅

---

**Готово! Тепер ви можете повністю протестувати функціонал Topic 9 через Postman** 🎉

