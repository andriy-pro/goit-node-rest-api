# goit-node-rest-api

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32.1-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)
[![SendGrid](https://img.shields.io/badge/SendGrid-Email%20Service-blue.svg)](https://sendgrid.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

Repository for the homework solution from the GoIT course 'Fullstack. Back End Development: Node.js', Topic 10: Email Verification with SendGrid.

---

# **Домашнє завдання. Тема 10. Верифікація email за допомогою SendGrid**

Створи гілку `hw06-email` з гілки `master`.

Продовж створення REST API для роботи з колекцією контактів. Додай верифікацію email користувача після реєстрації за допомогою сервісу [SendGrid](https://sendgrid.com/).

## Як повинен працювати процес верифікації

1. Після реєстрації користувач повинен отримати лист на email адресу, вказану під час реєстрації, з посиланням для верифікації свого email
2. Після першого кліку по посиланню в отриманому email користувач повинен отримати відповідь зі статусом 200, що означатиме успішну верифікацію email
3. Після повторного кліку по посиланню користувач повинен отримати помилку зі статусом 404

## Крок 1

### Підготовка інтеграції з SendGrid API

- Зареєструйся на [SendGrid](https://sendgrid.com/)
- Створи email відправника. Для цього в адміністративній панелі SendGrid перейди в меню Marketing в підменю senders і натисни кнопку "Create New Sender" у верхньому правому куті. Заповни обов'язкові поля в запропонованій формі. Збережи.
- Повинен прийти лист для верифікації на вказану email адресу (перевір спам, якщо не бачиш лист). Натисни на посилання в ньому і заверши процес.
- Тепер потрібно створити API токен доступу. Вибери меню "Email API", і підменю "Integration Guide". Тут вибираємо "Web API"
- Далі потрібно вибрати технологію Node.js
- На третьому кроці даємо назву нашому токену. Наприклад systemcats, натискаємо кнопку generate і отримуємо результат. Потрібно скопіювати цей токен (це важливо, тому що більше його побачити не зможеш).
- Отриманий API токен потрібно додати в файл `.env` нашого проекту

## Крок 2

### Створення ендпоінту для верифікації email

- Додай два поля `verificationToken` та `verify` до моделі `User`. Значення поля verify рівне `false` означатиме, що його email ще не верифіковано.

```js
{
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}
```

- Створи GET ендпоінт `/auth/verify/:verificationToken`, де будемо шукати `user` в моделі User за параметром `verificationToken`.
- Якщо користувач з таким токеном не знайдений, повернути помилку 'Not Found'
- Якщо користувач знайдений - встанови `verificationToken` в `null`, а поле `verify` в `true` в документі користувача і поверни успішну відповідь

### Запит на верифікацію

```
GET /auth/verify/:verificationToken
```

### Користувач не знайдений

```
Status: 404 Not Found
ResponseBody: {
  message: 'User not found'
}
```

### Успішна відповідь верифікації

```
Status: 200 OK
ResponseBody: {
  message: 'Verification successful',
}
```

## Крок 3

### Додавання email користувачу з посиланням для верифікації

При створенні користувача під час реєстрації:

- Створи `verificationToken` для користувача і запиши його в базу даних (для генерації токену використовуй пакет [uuid](https://www.npmjs.com/package/uuid) або [nanoid](https://www.npmjs.com/package/nanoid))
- Відправ email на пошту користувача і вкажи в повідомленні посилання для верифікації email (`/users/verify/:verificationToken`)
- Також необхідно врахувати, що тепер логін користувача не дозволений з неверифікованим email

## Крок 4

### Додавання повторної відправки email користувачу з посиланням для верифікації

Необхідно передбачити варіант, що користувач може випадково видалити лист. Він може не дійти до адресата з якоїсь причини. Наш сервіс відправки листів під час реєстрації дав помилку тощо.

#### @ POST /users/verify/

- Отримує `body` в форматі `{ email }`
- Якщо в `body` немає обов'язкового поля email, повертає JSON з ключем `{"message": "missing required field email"}` і статусом `400`
- Якщо з `body` все добре, повторно відправ лист з `verificationToken` на вказаний email, але тільки якщо користувач не верифікований
- Якщо користувач вже пройшов верифікацію, відправ json з ключем `{ message: "Verification has already been passed"}` зі статусом `400 Bad Request`

#### Запит на повторну відправку email

```
POST /users/verify
Content-Type: application/json
RequestBody: {
  "email": "example@example.com"
}
```

#### Помилка валідації повторної відправки email

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Error from Joi or another validation library>
```

#### Успішна відповідь повторної відправки email

```
Status: 200 Ok
Content-Type: application/json
ResponseBody: {
  "message": "Verification email sent"
}
```

#### Повторна відправка email для верифікованого користувача

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  message: "Verification has already been passed"
}
```

> **Зверни увагу**
>
> Як альтернативу SendGrid можна використовувати пакет [nodemailer](https://www.npmjs.com/package/nodemailer)

## Додаткове завдання (необов'язкове)

### 1. Написати dockerfile для твого додатку

---
