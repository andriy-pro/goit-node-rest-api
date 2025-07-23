# 🚀 GitHub Actions CI/CD для GoIT Node.js REST API

## 📋 Огляд конвеєра

Наш CI/CD конвеєр автоматично перевіряє код, запускає тести та готує додаток до
розгортання при кожному push або pull request.

## 🎯 Що перевіряє конвеєр

### 1. 🔍 **Code Quality & Linting**

- ESLint перевірка якості коду
- Дотримання стандартів кодування
- Виявлення потенційних помилок

### 2. 🧪 **Testing Matrix**

- **Unit тести** - сервіси та бізнес-логіка
- **Integration тести** - повний API workflow
- **Множинні версії Node.js** (18.x, 20.x, 22.x) - перевірка сумісності
- **Test coverage** звіти

**Чому тестуємо на різних версіях Node.js?**

- **18.x** - LTS версія (довгострокова підтримка)
- **20.x** - поточна LTS версія (рекомендована)
- **22.x** - найновіша версія (майбутня LTS)
- Це гарантує, що код працює на всіх підтримуваних версіях

### 3. 🏗️ **Build & Health Check**

- Запуск додатку
- Health check endpoints
- Перевірка доступності API

### 4. 🔒 **Security Audit**

- npm audit для вразливостей
- Перевірка залежностей

## 🚀 Налаштування GitHub Actions

### Крок 1: Перевірка package.json

Переконайтеся, що у `package.json` є необхідні скрипти:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "lint": "eslint ."
  }
}
```

### Крок 2: Активація GitHub Actions

1. **Push до репозиторію:**

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "feat: додати GitHub Actions CI/CD конвеєр"
   git push origin main
   ```

2. **Перевірка запуску:**
   - Йдіть на GitHub → ваш репозиторій → вкладка **Actions**
   - Ви маєте побачити запущений workflow "GoIT Node.js REST API - CI/CD
     Pipeline"

## 📊 Інтерпретація результатів

### ✅ Успішний запуск

Коли всі джоби пройшли успішно, ви побачите:

```
🔍 Code Quality & Linting: ✅ success
🧪 Tests (Node.js 18.x): ✅ success
🧪 Tests (Node.js 20.x): ✅ success
🧪 Tests (Node.js 22.x): ✅ success
🏗️ Build & Health Check: ✅ success
🔒 Security Audit: ✅ success
📋 Final CI/CD Report: ✅ success
```

### ❌ Провалені перевірки

Якщо щось пішло не так:

1. **Натисніть на червоний ❌** біля назви джоба
2. **Розгорніть логи** для детальної інформації
3. **Виправте проблему** локально
4. **Зробіть новий push** - CI запуститься автоматично

## 🔧 Налагодження типових проблем

### Проблема: ESLint помилки

```bash
# Локальна перевірка
npm run lint

# Автоматичне виправлення
npm run lint -- --fix
```

### Проблема: Тести не проходять

```bash
# Запуск тестів локально
npm test

# Тільки інтеграційні тести
npm test -- --testPathPattern=integration

# З детальним виводом
npm test -- --verbose
```

### Проблема: Сервер не запускається

Перевірте:

1. Файл `server.js` існує
2. Правильний import в `server.js`
3. Порт не зайнятий

```javascript
// server.js
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Проблема: npm audit помилки

```bash
# Локальна перевірка
npm audit

# Автоматичне виправлення
npm audit fix

# Тільки критичні вразливості
npm audit --audit-level=high
```

## 📈 Моніторинг та метрики

### GitHub Actions Usage

- **Безкоштовно:** 2000 хвилин/місяць для публічних репо
- **Приватні:** 2000 хвилин/місяць на безкоштовному плані
- **Оптимізація:** Використовуємо `paths-ignore` для пропуску документації

### Performance Metrics

Конвеєр відстежує:

- ⏱️ **Час виконання тестів**
- 📊 **Test coverage %**
- 🚀 **Час запуску сервера**

## 🔐 Secrets та змінні

### Безпека змінних середовищ

**Важливо:** У цьому проєкті тести запускаються локально, тому:

- `.env` файл НЕ комітиться в git (додано в .gitignore)
- CI/CD НЕ має доступу до твоїх секретів
- Жодні паролі не передаються в GitHub Actions
- Це забезпечує максимальну безпеку

### Коли потрібні secrets

Secrets потрібні тільки якщо:

- Тести потребують реальної бази даних
- API використовує зовнішні сервіси
- Потрібен доступ до приватних ресурсів

### Додавання secrets

1. GitHub → Repository → Settings → Secrets and variables → Actions
2. New repository secret
3. Додайте необхідні змінні:

```
DATABASE_URL=your-db-url
JWT_SECRET=your-jwt-secret
```

### Використання у workflow

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## 📋 Checklist активації

- [ ] `.github/workflows/ci.yml` файл створений
- [ ] `package.json` містить всі необхідні скрипти
- [ ] ESLint налаштований і працює
- [ ] Jest тести працюють локально
- [ ] Код зациклено в git і залито на GitHub
- [ ] GitHub Actions запустився автоматично
- [ ] Всі джоби проходять успішно ✅

## 🎓 Навчальні цілі

Цей CI/CD конвеєр демонструє:

✅ **DevOps практики** - автоматизація процесів розробки ✅ **Quality Gates** -
автоматична перевірка якості коду ✅ **Testing Strategy** - комплексне
тестування на різних рівнях ✅ **Security** - автоматична перевірка вразливостей
✅ **Monitoring** - відстеження метрик та продуктивності

## 🔗 Корисні посилання

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js CI/CD Best Practices](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [Jest in CI/CD](https://jestjs.io/docs/continuous-integration)
- [ESLint CI Integration](https://eslint.org/docs/user-guide/integrations#ci-cd-integrations)

---

**🎓 Створено для курсу GoIT "Fullstack. Back End Development: Node.js"** **📅
Тема 4: REST API + DevOps Best Practices**
