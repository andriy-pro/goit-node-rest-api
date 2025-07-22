# 📱 Postman Collection для GoIT Node.js REST API

## 🚀 Швидкий старт

1. **Імпортуйте колекцію:** Postman → Import → `docs/postman-collection.json`
2. **Створіть середовище:**
    - `baseUrl = http://localhost:3000` (або IP для WSL)
    - Активуйте середовище
3. **Запустіть тести:**
    - Collection Runner або вручну по черзі

## 🧪 Основні сценарії

- CRUD: створення, отримання, оновлення, видалення контакту
- Валідація: email, телефон (E.164), обов'язкові поля
- Негативні кейси: 400, 404, невалідні дані

## 🧩 Приклади curl

```bash
curl http://localhost:3000/api/contacts
curl http://localhost:3000/api/contacts/{{testContactId}}
```
