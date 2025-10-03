# 🌱 Database Seeders

Професійний скрипт для заповнення бази даних тестовими даними з використанням
найкращих практик.

## 📋 Використання

### Заповнення бази даних тестовими даними

```bash
npm run seed
```

**⚠️ УВАГА:** Скрипт запитає підтвердження перед видаленням даних!

## ✨ Особливості

- ✅ **Інтерактивне підтвердження** - скрипт попереджує про видалення даних
- ✅ **Використання Faker.js (Ukrainian)** - реалістичні дані з `fakerUK`
  (українська локаль)
- ✅ **Українська локалізація** - імена та прізвища українською (Коваленко,
  Шевченко, Мельник)
- ✅ **Кольоровий вивід** - зручний інтерфейс з використанням chalk
- ✅ **Bulk insert** - швидке створення контактів
- ✅ **JSDoc документація** - код задокументований згідно стандартів
- ✅ **Обробка помилок** - повідомлення про помилки
- ✅ **Головний користувач** - `mail@andriy.pro` з фіксованим контактом для
  демонстрації
- ✅ **Статистика** - детальна інформація про створені дані

## 📊 Що створюється

- **21 користувач** з різними рівнями підписки (starter, pro, business)
  - **Andriy Nechyporenko** (mail@andriy.pro) - головний тестовий користувач
  - 20 додаткових користувачів (user1@example.com - user20@example.com)
- **30 контактів** для кожного користувача (630 контактів загалом)
- **Спеціальний контакт** для Andriy Nechyporenko:
  - Vladyslav Apelhants (V.Apelhants@goit.ua, +380503661777, ⭐ в фаворитах)
- Реалістичні українські імена та прізвища (через Faker.js)
- Унікальні email адреси
- Українські номери телефонів (+380XX)
- Випадковий статус favorite

## 🔐 Дані для входу

### 👨‍💻 Головний користувач (рекомендовано для тестування):

| Email           | Password | Subscription | Контакт у фаворитах    |
| --------------- | -------- | ------------ | ---------------------- |
| mail@andriy.pro | goit2025 | pro          | Vladyslav Apelhants ⭐ |

### 📧 Додаткові користувачі:

| Email              | Password | Subscription |
| ------------------ | -------- | ------------ |
| user1@example.com  | goit2025 | starter      |
| user2@example.com  | goit2025 | pro          |
| user3@example.com  | goit2025 | business     |
| user4@example.com  | goit2025 | starter      |
| user5@example.com  | goit2025 | pro          |
| user6@example.com  | goit2025 | business     |
| user7@example.com  | goit2025 | starter      |
| user8@example.com  | goit2025 | pro          |
| user9@example.com  | goit2025 | business     |
| user10@example.com | goit2025 | starter      |
| ... до user20      | goit2025 | (cycling)    |

## 🧪 Тестування пагінації

З 30 контактами на користувача ви можете протестувати:

```bash
# Перша сторінка (20 контактів)
GET /api/contacts?page=1&limit=20

# Друга сторінка (5 контактів)
GET /api/contacts?page=2&limit=20

# Маленькі сторінки
GET /api/contacts?page=1&limit=5
GET /api/contacts?page=2&limit=5
GET /api/contacts?page=3&limit=5
```

## 🔧 Налаштування

Відредагуйте константи на початку файлу `seed-data.js`:

```javascript
const USERS_COUNT = 20; // Кількість користувачів
const CONTACTS_PER_USER = 30; // Контактів на користувача
const DEFAULT_PASSWORD = "goit"; // Пароль для всіх користувачів
const BCRYPT_ROUNDS = 10; // Раунди хешування bcrypt
```

## 🛠️ Технології

- **[@faker-js/faker](https://fakerjs.dev/)** - генерація реалістичних тестових
  даних
- **[chalk](https://www.npmjs.com/package/chalk)** - кольоровий вивід в консоль
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - хешування паролів
- **[readline](https://nodejs.org/api/readline.html)** - інтерактивний ввід
- **[Sequelize](https://sequelize.org/)** - ORM для роботи з базою даних

## 📝 Приклад виводу

```
⚠️  УВАГА! ⚠️
Цей скрипт повністю видалить ВСІ дані з бази даних та створить нові тестові дані!

Будуть створені:
  👥 Користувачів: 21 (включаючи Andriy Nechyporenko)
  📇 Контактів на користувача: 30
  📊 Всього контактів: 630
  🔑 Пароль для всіх: goit2025
  👨‍💻 Головний користувач: mail@andriy.pro

Ви впевнені, що хочете продовжити? (y/N): y

🔄 Підключення до бази даних...
✅ З'єднання встановлено

🗑️  Очищення бази даних...
✅ База даних очищена

👥 Створення користувачів...
  ✅ [1/21] mail@andriy.pro (pro) - Andriy Nechyporenko
  ✅ [2/21] user1@example.com (starter)
  ✅ [3/21] user2@example.com (pro)
  ...
  ✅ [21/21] user20@example.com (starter)

📇 Створення контактів...
  ✅ [1/21] 30 контактів для mail@andriy.pro
  ✅ [2/21] 30 контактів для user1@example.com
  ...
  ✅ [21/21] 30 контактів для user20@example.com

✨ Seed завершено успішно!

📊 Статистика:
   👥 Користувачів: 21
   📇 Контактів: 630
   📈 Контактів на користувача: 30

🔐 Дані для входу:
   Пароль для всіх: goit2025

   👨‍💻 Головний користувач:
   mail@andriy.pro (Andriy Nechyporenko, subscription: pro)

   📧 Інші користувачі:
   user1@example.com         user2@example.com         user3@example.com
   user4@example.com         user5@example.com         user6@example.com
   user7@example.com         user8@example.com         user9@example.com
   user10@example.com        user11@example.com        user12@example.com
   user13@example.com        user14@example.com        user15@example.com
   user16@example.com        user17@example.com        user18@example.com
   user19@example.com        user20@example.com
```

## 🔒 Безпека

- Скрипт завжди запитує підтвердження перед видаленням даних
- Використовується bcrypt для безпечного хешування паролів
- Bulk insert для оптимізації продуктивності
- Автоматичне закриття з'єднання при помилках

## 💡 Порада

Для тестування великих обсягів даних змініть константи:

```javascript
const USERS_COUNT = 50; // Для тестування з багатьма користувачами
const CONTACTS_PER_USER = 100; // Для тестування пагінації
```
