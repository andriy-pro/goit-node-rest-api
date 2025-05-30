import { contactCreateSchema } from './src/schemas/contactsSchemas.js';

console.log('=== Тестування E.164 валідації ===');

// Тест 1: Невалідний короткий номер
const contact1 = { name: 'Test', email: 'test@example.com', phone: '+123' };
const result1 = contactCreateSchema.validate(contact1);
console.log('\n1. Short phone (+123):');
console.log('Error:', result1.error?.details?.[0]?.message || 'No error');
console.log('Valid:', !result1.error);

// Тест 2: Валідний український номер
const contact2 = { name: 'Test', email: 'test@example.com', phone: '+380671234567' };
const result2 = contactCreateSchema.validate(contact2);
console.log('\n2. Valid Ukrainian phone (+380671234567):');
console.log('Error:', result2.error?.details?.[0]?.message || 'No error');
console.log('Valid:', !result2.error);

// Тест 3: Старий формат (має бути невалідний)
const contact3 = { name: 'Test', email: 'test@example.com', phone: '(123) 456-7890' };
const result3 = contactCreateSchema.validate(contact3);
console.log('\n3. Old format phone ((123) 456-7890):');
console.log('Error:', result3.error?.details?.[0]?.message || 'No error');
console.log('Valid:', !result3.error);

// Тест 4: Номер без + (має бути невалідний)
const contact4 = { name: 'Test', email: 'test@example.com', phone: '380671234567' };
const result4 = contactCreateSchema.validate(contact4);
console.log('\n4. Phone without + (380671234567):');
console.log('Error:', result4.error?.details?.[0]?.message || 'No error');
console.log('Valid:', !result4.error);
