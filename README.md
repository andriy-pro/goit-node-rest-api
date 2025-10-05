# goit-node-rest-api

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-brightgreen.svg)](https://www.npmjs.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32.1-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%3E%3D12.0-blue.svg)](https://www.postgresql.org/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-Email%20Service-blue.svg)](https://nodemailer.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

Repository for the homework solution from the GoIT course 'Fullstack. Back End Development: Node.js', Topic 11: Websockets (Email Verification with Nodemailer).

---

# **Домашнє завдання. Тема 11. Websockets**

Створи гілку `hw06-email` з гілки `master`.

Продовжуємо створення REST API для роботи з колекцією контактів. Додайте верифікацію email користувача після реєстрації за допомогою сервісу [ukr.net](https://ukr.net) та пакету Nodemailer.

## Як повинен працювати процес верифікації

1. Після реєстрації, користувач повинен отримати лист на вказану при реєстрації пошту з посиланням для верифікації свого email
2. Пройшовши посиланням в отриманому листі, в перший раз, користувач повинен отримати відповідь зі статусом 200, що буде мати на увазі успішну верифікацію email
3. Пройшовши по посиланню повторно користувач повинен отримати помилку зі статусом 404

## Крок 1

### Підготовка інтеграції з API ukr.net

Прочитай детальну інструкцію за посиланням для налаштування інтеграції з ukr.net та Nodemailer.

## Крок 2

### Створення ендпоінту для верифікації email

**1.** Додати в модель `User` два поля `verificationToken` і `verify`. Значення поля `verify` рівне `false` означатиме, що його email ще не пройшов верифікацію

```js
{
  verify: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },
  verificationToken: {
    type: DataType.STRING,
  },
}
```

**2.** Створити ендпоінт GET `/auth/verify/:verificationToken`, де по параметру `verificationToken` ми будемо шукати користувача в моделі `User`

- Якщо користувач з таким токеном не знайдений, необхідно повернути помилку 'Not Found'
- Якщо користувач знайдений, встановлюємо `verificationToken` в `null`, а поле `verify` ставимо рівним `true` в документі користувача і повертаємо успішну відповідь

### Запит на верифікацію (Verification request)

```
GET /auth/verify/:verificationToken
```

### Користувач не знайдений (Verification user Not Found)

```
Status: 404 Not Found
ResponseBody: {
  message: 'User not found'
}
```

### Успішна відповідь верифікації (Verification success response)

```
Status: 200 OK
ResponseBody: {
  message: 'Verification successful',
}
```

## Крок 3

### Додавання відправки email користувачу з посиланням для верифікації

При створення користувача при реєстрації:

- Створити `verificationToken` для користувача і записати його в БД (для генерації токена використовуйте пакет [uuid](https://www.npmjs.com/package/uuid) або [nanoid](https://www.npmjs.com/package/nanoid))
- Відправити email на пошту користувача і вказати посилання для верифікації email'а (`/auth/verify/:verificationToken`) в повідомленні

Так само необхідно враховувати, що тепер логін користувача не дозволено, якщо не верифікувано email

## Крок 4

### Додавання повторної відправки email користувачу з посиланням для верифікації

Необхідно передбачити, варіант, що користувач може випадково видалити лист. Воно може не дійти з якоїсь причини до адресата. Наш сервіс відправки листів під час реєстрації видав помилку і т.д.

#### POST /auth/verify

- Отримує `body` в форматі `{email}`
- Якщо в `body` немає обов'язкового поля `email`, повертає json з ключем `{"message":"missing required field email"}` і статусом `400`
- Якщо з `body` все добре, виконуємо повторну відправку листа з `verificationToken` на вказаний email, але тільки якщо користувач не верифікований
- Якщо користувач вже пройшов верифікацію відправити json з ключем `{"message":"Verification has already been passed"}` зі статусом `400 Bad Request`

#### Запит на повторну відправку email (Resending an email request)

```
POST /auth/verify
Content-Type: application/json
RequestBody: {
  "email": "example@example.com"
}
```

#### Помилка валідації повторної відправки email (Resending an email validation error)

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  "message": "Помилка від Joi або іншої бібліотеки валідації"
}
```

#### Успішна відповідь повторної відправки email (Resending an email success response)

```
Status: 200 Ok
Content-Type: application/json
ResponseBody: {
  "message": "Verification email sent"
}
```

#### Повторна відправка email для верифікованого користувача (Resend email for verified user)

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: {
  message: "Verification has already been passed"
}
```

---

## ⚠️ **КРИТИЧНЕ ПОПЕРЕДЖЕННЯ ПРО ТЕСТИ**

**УВАГА! Запуск тестів (`npm test`) ПОВНІСТЮ ЗНИЩУЄ ВСІ ДАНІ В БАЗІ ДАНИХ!**

- ❌ Тести видаляють **ВСІ таблиці** через `sync({ force: true })`
- ❌ Використовують ту **базу даних** що вказана в `.env` (часто це робоча база для розробки)

### Мінімальна безпека

```bash
# ЗАВЖДИ робіть бекап перед тестами!
pg_dump your-database > backup.sql
npm test
```

А ще **краще** :
**ВИКОРИСТОВУЙТЕ ОКРЕМУ ТЕСТОВУ БАЗУ ДАНИХ!**
