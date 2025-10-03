# goit-node-rest-api

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32.1-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)
[![bcrypt](https://img.shields.io/badge/bcrypt-Password%20Hashing-green.svg)](https://www.npmjs.com/package/bcrypt)

Repository for the homework solution from the GoIT course 'Fullstack. Back End
Development: Node.js', Topic 7: Authentication and Authorization.

---

# **Домашнє завдання. Тема 7. Аутентифікація та авторизація**

Створи гілку `04-auth` з гілки `master`.

Продовж створення REST API для роботи з колекцією контактів. Додай логіку
аутентифікації / авторизації користувача через [JWT](https://jwt.io/).

## Крок 1

**1.** У коді створити модель користувача для таблиці `users`.

```js
{
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  subscription: {
      type: DataTypes.ENUM,
      values: ["starter", "pro", "business"],
      defaultValue: "starter"
  },
  token: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
}
```

**2.** Змінити модель контактів, щоб кожен користувач бачив тільки свої
контакти. Для цього в модель контактів додати властивість

```js
   owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
```

## Крок 2

### Реєстрація

**1.** Створити ендпоінт `/api/auth/register`

**2.** Зробити валідацію всіх обов'язкових полів (email і password). При помилці
валідації повернути [Помилку валідації](#registration-validation-error).

У разі успішної валідації в моделі `User` створити користувача за даними, які
пройшли валідацію. Для хешування паролів використовуй
[bcrypt](https://www.npmjs.com/package/bcrypt) або
[bcryptjs](https://www.npmjs.com/package/bcryptjs)

- Якщо пошта вже використовується кимось іншим, повернути
  [Помилку Conflict](#registration-conflict-error).
- В іншому випадку повернути
  [Успішну відповідь](#registration-success-response).

**Registration request**

```
POST /api/auth/register
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "examplepassword"
}
```

**Registration validation error**

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  "message": "Помилка від Joi або іншої бібліотеки валідації"
}
```

**Registration conflict error**

```
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "Email in use"
}
```

**Registration success response**

```
Status: 201 Created
Content-Type: application/json
ResponseBody: {
  "user": {
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

### Логін

**1.** Створити ендпоінт `/api/auth/login`

**2.** В моделі `User` знайти користувача за `email`.

**3.** Зробити валідацію всіх обов'язкових полів (email і password). При помилці
валідації повернути [Помилку валідації](#login-validation-error).

- В іншому випадку, порівняти пароль для знайденого користувача, якщо паролі
  збігаються створити токен, зберегти в поточному юзера і повернути
  [Успішну відповідь](#login-success-response).
- Якщо пароль або імейл невірний, повернути
  [Помилку Unauthorized](#login-auth-error).

**Login request**

```
POST /api/auth/login
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "examplepassword"
}
```

**Login validation error**

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  "message": "Помилка від Joi або іншої бібліотеки валідації"
}
```

**Login success response**

```
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "token": "exampletoken",
  "user": {
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

**Login auth error**

```
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

## Крок 3

### Перевірка токена

Створити мідлвар для перевірки токена і додай його до всіх раутів, які повинні
бути захищені.

- Мідлвар бере токен з заголовків `Authorization`, перевіряє токен на
  валідність.
- У випадку помилки повернути
  [Помилку Unauthorized](#middleware-unauthorized-error).
- Якщо валідація пройшла успішно, отримати з токена `id` користувача. Знайти
  користувача в базі даних з цим `id`.
- Якщо користувач існує і токен збігається з тим, що знаходиться в базі,
  записати його дані в `req.user` і викликати `next()`.
- Якщо користувача з таким `id` НЕ існує або токени не збігаються, повернути
  [Помилку Unauthorized](#middleware-unauthorized-error)

**Middleware unauthorized error**

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

## Крок 4

### Логаут

**1.** Створити ендпоінт `/api/auth/logout`

**2.** Додати в маршрут мідлвар перевірки токена.

- У моделі `User` знайти користувача за `id`.
- Якщо користувача не існує, повернути
  [Помилку Unauthorized](#logout-unauthorized-error).
- В іншому випадку, видалити токен у поточного юзера і повернути
  [Успішну відповідь](#logout-success-response).

**Logout request**

```
POST /api/auth/logout
Authorization: "Bearer {{token}}"
```

**Logout unauthorized error**

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

**Logout success response**

```
Status: 204 No Content
```

## Крок 5

### Поточний користувач - отримати дані юзера по токені

**1.** Створити ендпоінт `/api/auth/current`

**2.** Додати в раут мідлвар перевірки токена.

- Якщо користувача не існує, повернути
  [Помилку Unauthorized](#current-user-unauthorized-error)
- В іншому випадку повернути [Успішну відповідь](#current-user-success-response)

**Current user request**

```
GET /api/auth/current
Authorization: "Bearer {{token}}"
```

**Current user unauthorized error**

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

**Current user success response**

```
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "email": "example@example.com",
  "subscription": "starter"
}
```

## Додаткове завдання (необов'язкове)

- ✅ Зробити пагінацію для колекції контактів (GET
  /api/contacts?page=1&limit=20).
- ✅ Зробити фільтрацію контактів по полю обраного (GET
  /api/contacts?favorite=true)
- ✅ Оновлення підписки (`subscription`) користувача через ендпоінт `PATCH`
  `/api/auth/subscription`. Підписка повинна мати одне з наступних значень
  `['starter', 'pro', 'business']`
- ✅ **Додатково:** Сортування контактів (GET
  /api/contacts?sortBy=name&sortOrder=ASC)

### Підтримка сортування

API підтримує гнучке сортування контактів:

**Доступні поля для сортування:**

- `name` - За іменем (за замовчуванням)
- `email` - За email адресою
- `createdAt` - За датою створення
- `favorite` - За статусом favorite

**Порядок сортування:**

- `ASC` - За зростанням (А→Я)
- `DESC` - За спаданням (Я→А)

**Приклади:**

```
GET /api/contacts?sortBy=name&sortOrder=ASC
GET /api/contacts?sortBy=createdAt&sortOrder=DESC
GET /api/contacts?page=1&limit=10&favorite=true&sortBy=name
```

Детальніше: [docs/SORTING-AND-LOCALE-GUIDE.md](docs/SORTING-AND-LOCALE-GUIDE.md)

---

> **Зверни увагу**
>
> - Для роботи з JWT токенами використовуй бібліотеку
>   [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
> - Для хешування паролів використовуй
>   [bcrypt](https://www.npmjs.com/package/bcrypt) або
>   [bcryptjs](https://www.npmjs.com/package/bcryptjs)
> - Для валідації даних використовуй [Joi](https://www.npmjs.com/package/joi)
> - Всі маршрути контактів повинні бути захищені мідлваром аутентифікації

---
