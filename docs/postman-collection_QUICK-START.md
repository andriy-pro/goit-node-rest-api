# 🚀 Швидкий старт з Postman колекцією Topic 11

## 📥 Імпорт колекції

1. Відкрийте Postman
2. Натисніть **Import** → **Upload Files**
3. Оберіть файл: `docs/postman-collection_topic-11.json`
4. Натисніть **Import**

## ⚙️ Налаштування середовища

### 1. Створіть Environment:
- Назва: `GoIT Topic 11 - Email Verification`
- Змінні:
```env
baseUrl: http://localhost:3000
authToken: (залишити порожнім)
uniqueEmail: (залишити порожнім)
verificationToken: (залишити порожнім)
testPassword: goit2025
```

### 2. Налаштуйте .env файл:
```env
# Email Configuration for Verification (ukr.net)
UKR_NET_EMAIL=your_email@ukr.net
UKR_NET_PASSWORD=your_app_password
BASE_URL=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key

# PostgreSQL
DB_HOST=localhost
DB_NAME=db-contacts
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
```

## 🧪 Послідовність тестування

### Крок 1: Підготовка
1. Запустіть сервер: `npm run dev`
2. Виконайте: **🧰 Підготовка** → **📝 Реєстрація з email верифікацією**

### Крок 2: Перевірка блокування
3. Виконайте: **🚫 Логін без верифікації** → **❌ Спроба логіну неверифікованого користувача**
   - Має повернути `401 "Email not verified"`

### Крок 3: Отримання токена верифікації
**Варіант A: З консолі сервера**
- Подивіться в консоль сервера на повідомлення про відправку email
- Скопіюйте `verificationToken`

**Варіант B: З бази даних**
```sql
SELECT email, verificationToken FROM "Users" WHERE email = 'your_generated_email';
```

**Варіант C: З email (якщо налаштований ukr.net)**
- Перевірте email скриньку
- Скопіюйте токен з посилання

### Крок 4: Встановлення токена
4. В Environment встановіть змінну `verificationToken` зі скопійованим значенням

### Крок 5: Верифікація
5. Виконайте: **📧 Email верифікація** → **✅ Верифікація email за токеном**
   - Має повернути `200 "Verification successful"`

### Крок 6: Успішний логін
6. Виконайте: **✅ Логін після верифікації** → **🔓 Успішний логін верифікованого користувача**
   - Має повернути токен та user об'єкт

### ⚠️ Важливо про Resend:
Якщо ви використовуєте **📧 Повторна відправка email**, пам'ятайте:
- Сервер може згенерувати **новий verificationToken**
- Після успішного resend (200) **обов'язково оновіть** змінну `verificationToken` в Environment
- Інакше верифікація не спрацює зі старим токеном

## 🔍 Додаткові тести

### Негативні сценарії:
- **❌ Повторна верифікація** - має повернути 404
- **❌ Неіснуючий токен** - має повернути 404
- **❌ Повторна відправка без email** - має повернути 400
- **❌ Повторна відправка для неіснуючого користувача** - має повернути 404

### Позитивні сценарії:
- **📧 Повторна відправка для неверифікованого користувача** - має повернути 200
  - ⚠️ **ВАЖЛИВО:** Сервер може згенерувати новий `verificationToken`!
  - Після успішного resend (200) перевірте БД та оновіть змінну в Environment
- **👤 Отримання поточного користувача** - має повернути user дані

## 🐛 Troubleshooting

### Проблема: Email не відправляється
**Рішення:**
1. Перевірте налаштування ukr.net в .env
2. Переконайтеся що `UKR_NET_PASSWORD` - це app password, не звичайний пароль
3. Перевірте консоль сервера на помилки Nodemailer

### Проблема: verificationToken не знайдений
**Рішення:**
1. Перевірте БД: `SELECT * FROM "Users" ORDER BY "createdAt" DESC LIMIT 1;`
2. Скопіюйте `verificationToken` з результату
3. Встановіть в Postman Environment

### Проблема: 401 "Email not verified" після верифікації
**Рішення:**
1. Перевірте БД: `SELECT email, verify FROM "Users" WHERE email = 'your_email';`
2. Переконайтеся що `verify = true`
3. Якщо `verify = false`, повторіть верифікацію

### Проблема: Верифікація не працює після resend
**Рішення:**
1. **Сервер міг згенерувати новий токен** при resend!
2. Перевірте БД: `SELECT verificationToken FROM "Users" WHERE email = 'your_email';`
3. Скопіюйте новий токен та оновіть змінну `verificationToken` в Postman Environment
4. Повторіть верифікацію з новим токеном

## 📊 Корисні SQL запити

```sql
-- Всі користувачі
SELECT email, verify, verificationToken, "createdAt" FROM "Users" ORDER BY "createdAt" DESC;

-- Неверифіковані користувачі
SELECT email, verificationToken FROM "Users" WHERE verify = false;

-- Верифіковані користувачі  
SELECT email FROM "Users" WHERE verify = true;

-- Очистити тестових користувачів
DELETE FROM "Users" WHERE email LIKE 'test%@example.com';
```

## ✅ Очікувані результати

| Запит | Статус | Відповідь |
|-------|--------|-----------|
| Реєстрація | 201 | `{ user: { email, subscription } }` |
| Логін без верифікації | 401 | `{ message: "Email not verified" }` |
| Верифікація | 200 | `{ message: "Verification successful" }` |
| Повторна верифікація | 404 | `{ message: "User not found" }` |
| Логін після верифікації | 200 | `{ token, user: { email, subscription } }` |
| Повторна відправка (неверифікований) | 200 | `{ message: "Verification email sent" }` |
| Повторна відправка (верифікований) | 400 | `{ message: "Verification has already been passed" }` |

Успішного тестування! 🎉