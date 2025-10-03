# goit-node-rest-api

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32.1-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)
[![Multer](https://img.shields.io/badge/Multer-File%20Upload-orange.svg)](https://github.com/expressjs/multer)
[![Jest](https://img.shields.io/badge/Jest-Testing-red.svg)](https://jestjs.io/)

Repository for the homework solution from the GoIT course 'Fullstack. Back End
Development: Node.js', Topic 9: Working with Files and Testing Applications.

---

# **Домашнє завдання. Тема 9. Робота з файлами та тестування додатків**

Створи гілку `hw05-avatars` з гілки `master`.

Продовж створення REST API для роботи з колекцією контактів. Додай можливість
завантаження аватарки користувача через
[Multer](https://github.com/expressjs/multer).

## Крок 1

- Створи папку `public` для роздачі статики. У цій папці зроби папку `avatars`.
- Налаштуй Express на роздачу статичних файлів з папки `public`.
- Поклади будь-яке зображення в папку `public/avatars` і перевір, що роздача
  статики працює.
- При переході по такому URL браузер відобразить зображення:
  `http://localhost:<порт>/avatars/<ім'я файлу з розширенням>`

## Крок 2

У схему користувача додай нову властивість `avatarURL` для зберігання
зображення.

```js
{
  ...
  avatarURL: DataTypes.STRING,
  ...
}
```

Використовуй пакет [gravatar](https://www.npmjs.com/package/gravatar) для того,
щоб при реєстрації нового користувача відразу згенерувати йому аватар по його
`email`.

## Крок 3

При реєстрації користувача:

- Створюй посилання на аватарку користувача за допомогою
  [gravatar](https://www.npmjs.com/package/gravatar)
- Отриманий URL збережи в поле `avatarURL` під час створення користувача

## Крок 4

Додай можливість поновлення аватарки, створивши ендпоінт `/auth/avatars` і
використовуючи метод `PATCH`.

**Запит**

```
PATCH /auth/avatars
Content-Type: multipart/form-data
Authorization: "Bearer {{token}}"
RequestBody: завантажений файл
```

**Успішна відповідь**

```
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "avatarURL": "тут буде посилання на зображення"
}
```

**Неуспішна відповідь**

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

- Створи папку `temp` в корені проекту і зберігай в неї завантажену аватарку.
- Перенеси аватарку користувача з папки `temp` в папку `public/avatars` і дай їй
  унікальне ім'я для конкретного користувача.
- Отриманий `URL` `/avatars/<ім'я файлу з розширенням>` та збережи в поле
  `avatarURL` користувача

## Додаткове завдання (необов'язкове)

Написати unit-тести для контролера входу (логін) за допомогою
[Jest](https://jestjs.io/ru/docs/getting-started):

- відповідь повина мати статус-код 200
- у відповіді повинен повертатися токен
- у відповіді повинен повертатися об'єкт `user` з 2 полями `email` и
  `subscription` з типом даних `String`

---

> **Зверни увагу**
>
> - Для завантаження файлів використовуй
>   [Multer](https://github.com/expressjs/multer)
> - Для генерації аватара використовуй
>   [gravatar](https://www.npmjs.com/package/gravatar)
> - Для написання тестів використовуй [Jest](https://jestjs.io/)
> - Ендпоінт оновлення аватарки повинен бути захищений мідлваром аутентифікації

---
