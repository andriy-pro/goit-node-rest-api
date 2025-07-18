# goit-node-rest-api

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32.1-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Render-cloud-blue.svg)](https://render.com/)
[![pgAdmin](https://img.shields.io/badge/pgAdmin-4-blue.svg)](https://www.pgadmin.org/)

Repository for the homework solution from the GoIT course 'Fullstack. Back End Development: Node.js', Topic 6: PostgresSQL and Sequelize.

---

# **Домашнє завдання. Тема 6. PostgresSQL та Sequelize**

Створи гілку `03-postgresql` з гілки `master`.

Продовж створення REST API для роботи з колекцією контактів.

## Крок 1

- Створи акаунт на [Render](https://render.com/). Після чого в акаунті створи нову базу даних PostgresSQL, яку треба назвати `db-contacts`.

## Крок 2

- Встанови графічний редактор [pgAdmin](https://www.pgadmin.org/download/) для зручної роботи з базою даних для PosgresSQL. Підключись до створеної хмарної бази через графічний редактор та створи таблицю `contacts`.

## Крок 3

Використовуй вихідний код домашньої роботи #2 і заміни зберігання контактів з json-файлу на створену тобою базу даних.

- Напиши код для створення підключення до PosgresSQL за допомогою [Sequelize](https://www.npmjs.com/package/sequelize).
- При успішному підключенні виведи в консоль повідомлення `"Database connection successful"`.
- Обов'язково обробив помилку підключення. Виведи в консоль повідомлення помилки і заверши процес використовуючи `process.exit(1)`.
- У функціях обробки запитів заміни код CRUD-операцій над контактами з файлу, на Sequelize-методи для роботи з колекцією контактів в базі даних.

### Sequelize-модель `contacts`

```js
const Contact = sequelize.define(
  'contact', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }
);
```

## Крок 4

У нас з'явилося в контактах додаткове поле статусу `favorite`, яке приймає логічне значення `true` або `false`. Воно відповідає за те, що в обраному чи ні знаходиться зазначений контакт. Потрібно реалізувати для оновлення статусу контакту новий роутер:

**PATCH /api/contacts/:contactId/favorite**

- Отримує параметр `contactId`
- Отримує `body` в json-форматі c оновленням поля `favorite`
- Якщо з `body` все добре, викликає функцію `updateStatusContact (contactId, body)` (напиши її) для поновлення контакту в базі
- За результатом роботи функції повертає оновлений об'єкт контакту і статусом `200`. В іншому випадку, повертає json з ключем `{"message":"Not found"}` і статусом `404`

---
