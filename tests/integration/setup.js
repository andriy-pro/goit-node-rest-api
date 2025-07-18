// Завантаження змінних середовища для тестів
import 'dotenv/config';

import sequelize from '../../src/db/connection.js';

beforeAll(async () => {
  // Runs before all test suites
});

afterAll(async () => {
  // Runs after all test suites
  await sequelize.close();
}); 