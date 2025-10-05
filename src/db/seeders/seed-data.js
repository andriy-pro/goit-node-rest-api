import 'dotenv/config';
import bcrypt from 'bcrypt';
import { createInterface } from 'readline';
// Використовуємо українську локаль Faker.js
// fakerUK автоматично налаштований на українську мову
import { fakerUK as faker } from '@faker-js/faker';
import chalk from 'chalk';
import sequelize from '../connection.js';
import User from '../../models/User.js';
import Contact from '../../models/Contact.js';
import { getGravatarUrl } from '../../helpers/gravatar.js';



// Константи
const USERS_COUNT = 20;
const CONTACTS_PER_USER = 30;
const DEFAULT_PASSWORD = 'goit2025'; // Мінімум 6 символів для Joi валідації
const BCRYPT_ROUNDS = 10;

/**
 * Створює інтерфейс readline для отримання вводу від користувача
 */
function createReadlineInterface() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Запитує підтвердження у користувача
 * @param {string} question - Питання для користувача
 * @returns {Promise<boolean>} - true якщо користувач підтвердив, false якщо ні
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question(chalk.yellow(question), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Виводить попередження про видалення даних
 */
function displayWarning() {
  console.log(chalk.red.bold('\n⚠️  УВАГА! ⚠️'));
  console.log(
    chalk.red(
      'Цей скрипт повністю видалить ВСІ дані з бази даних та створить нові тестові дані!'
    )
  );
  console.log(chalk.yellow('\nБудуть створені:'));
  console.log(chalk.cyan(`  👥 Користувачів: ${USERS_COUNT + 1} (включаючи Andriy Nechyporenko)`));
  console.log(chalk.cyan(`  📇 Контактів на користувача: ${CONTACTS_PER_USER}`));
  console.log(
    chalk.cyan(`  📊 Всього контактів: ${(USERS_COUNT + 1) * CONTACTS_PER_USER}`)
  );
  console.log(chalk.yellow(`  🔑 Пароль для всіх: ${DEFAULT_PASSWORD}`));
  console.log(chalk.magenta(`  👨‍💻 Головний користувач: mail@andriy.pro\n`));
}

/**
 * Очищує базу даних
 */
async function clearDatabase() {
  console.log(chalk.blue('\n🗑️  Очищення бази даних...'));
  await sequelize.sync({ force: true });
  console.log(chalk.green('✅ База даних очищена'));
}

/**
 * Генерує унікальний email
 * @param {number} index - Індекс користувача
 * @returns {string} - Email адреса
 */
function generateEmail(index) {
  return `user${index}@example.com`;
}

/**
 * Генерує підписку на основі індексу
 * @param {number} index - Індекс користувача
 * @returns {string} - Тип підписки
 */
function generateSubscription(index) {
  const subscriptions = ['starter', 'pro', 'business'];
  return subscriptions[index % subscriptions.length];
}

/**
 * Створює користувачів
 * @returns {Promise<Array>} - Масив створених користувачів
 */
async function createUsers() {
  console.log(chalk.blue('\n👥 Створення користувачів...'));
  const users = [];
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  // Створюємо обов'язкового користувача Andriy Nechyporenko
  const andriyEmail = 'mail@andriy.pro';
  const andriyUser = await User.create({
    email: andriyEmail,
    password: hashedPassword,
    subscription: 'pro',
    avatarURL: getGravatarUrl(andriyEmail),
    verify: true, // Тестові користувачі верифіковані
    verificationToken: null // Верифіковані користувачі не мають токена
  });
  users.push(andriyUser);
  console.log(
    chalk.green(`  ✅ [1/${USERS_COUNT + 1}] ${andriyUser.email} (${andriyUser.subscription}) - Andriy Nechyporenko`)
  );

  // Створюємо інших користувачів
  for (let i = 1; i <= USERS_COUNT; i++) {
    const email = generateEmail(i);
    const user = await User.create({
      email,
      password: hashedPassword,
      subscription: generateSubscription(i),
      avatarURL: getGravatarUrl(email),
      verify: true, // Тестові користувачі верифіковані
      verificationToken: null
    });
    users.push(user);
    console.log(
      chalk.green(`  ✅ [${i + 1}/${USERS_COUNT + 1}] ${user.email} (${user.subscription})`)
    );
  }

  return users;
}

/**
 * Генерує український номер телефону
 * @returns {string} - Номер телефону у форматі +380XXXXXXXXX
 */
function generatePhoneNumber() {
  const operators = ['67', '68', '96', '97', '98', '50', '66', '95', '99', '63'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `+380${operator}${number}`;
}

/**
 * Створює контакти для користувачів
 * @param {Array} users - Масив користувачів
 * @returns {Promise<number>} - Кількість створених контактів
 */
async function createContacts(users) {
  console.log(chalk.blue('\n📇 Створення контактів...'));
  let totalContacts = 0;

  for (const [index, user] of users.entries()) {
    const contacts = [];

    // Для Andriy Nechyporenko створюємо спеціальний контакт
    if (user.email === 'mail@andriy.pro') {
      contacts.push({
        name: 'Vladyslav Apelhants',
        email: 'V.Apelhants@goit.ua',
        phone: '+380503661777',
        favorite: true,
        owner: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Додаємо решту контактів
      for (let i = 1; i < CONTACTS_PER_USER; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        contacts.push({
          name: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          phone: generatePhoneNumber(),
          favorite: faker.datatype.boolean(),
          owner: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      // Для інших користувачів - стандартні контакти
      for (let i = 0; i < CONTACTS_PER_USER; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        contacts.push({
          name: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          phone: generatePhoneNumber(),
          favorite: faker.datatype.boolean(),
          owner: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Bulk insert для швидкості
    await Contact.bulkCreate(contacts);
    totalContacts += contacts.length;

    console.log(
      chalk.green(
        `  ✅ [${index + 1}/${users.length}] ${CONTACTS_PER_USER} контактів для ${user.email}`
      )
    );
  }

  return totalContacts;
}

/**
 * Виводить підсумкову статистику
 * @param {number} totalContacts - Загальна кількість контактів
 */
function displaySummary(totalContacts) {
  console.log(chalk.green.bold('\n✨ Seed завершено успішно!\n'));
  console.log(chalk.cyan('📊 Статистика:'));
  console.log(chalk.white(`   👥 Користувачів: ${USERS_COUNT + 1}`));
  console.log(chalk.white(`   📇 Контактів: ${totalContacts}`));
  console.log(chalk.white(`   📈 Контактів на користувача: ${CONTACTS_PER_USER}`));

  console.log(chalk.cyan('\n🔐 Дані для входу:'));
  console.log(chalk.yellow(`   Пароль для всіх: ${DEFAULT_PASSWORD}\n`));

  // Виводимо спеціального користувача окремо
  console.log(chalk.magenta.bold('   👨‍💻 Головний користувач:'));
  console.log(chalk.white('   mail@andriy.pro (Andriy Nechyporenko, subscription: pro)\n'));

  console.log(chalk.cyan('   📧 Інші користувачі:'));
  const columns = 3;
  const rows = Math.ceil(USERS_COUNT / columns);

  for (let row = 0; row < rows; row++) {
    let line = '   ';
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col + 1;
      if (index <= USERS_COUNT) {
        const email = generateEmail(index);
        line += chalk.white(`${email.padEnd(25)} `);
      }
    }
    console.log(line);
  }
  console.log();
}

/**
 * Основна функція для заповнення бази даних
 */
async function seedDatabase() {
  try {
    // Виводимо попередження
    displayWarning();

    // Запитуємо підтвердження
    const confirmed = await askConfirmation(
      'Ви впевнені, що хочете продовжити? (y/N): '
    );

    if (!confirmed) {
      console.log(chalk.yellow('\n❌ Операція скасована користувачем'));
      process.exit(0);
    }

    // Підключення до бази даних
    console.log(chalk.blue('\n🔄 Підключення до бази даних...'));
    await sequelize.authenticate();
    console.log(chalk.green('✅ З\'єднання встановлено'));

    // Очищення бази даних
    await clearDatabase();

    // Створення користувачів
    const users = await createUsers();

    // Створення контактів
    const totalContacts = await createContacts(users);

    // Виводимо статистику
    displaySummary(totalContacts);

    // Закриваємо з'єднання
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n❌ Помилка при заповненні бази даних:'));
    console.error(chalk.red(error.message));
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

// Запуск скрипта
seedDatabase();

