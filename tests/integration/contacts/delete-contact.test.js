import request from 'supertest';
import app from '../../../src/app.js';
import { createTestContactInDb } from '../../../tests/helpers/testConstants.js';

describe('DELETE /api/contacts/:id', () => {
  it('should delete an existing contact and return it with status 200', async () => {
    const contact = await createTestContactInDb();
    
    const response = await request(app)
      .delete(`/api/contacts/${contact.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    // Повертає видалений контакт
    expect(response.body).toHaveProperty('id', contact.id);
    expect(response.body).toHaveProperty('name', contact.name);
    expect(response.body).toHaveProperty('email', contact.email);
    expect(response.body).toHaveProperty('phone', contact.phone);
  });

  it('should return 404 for non-existent contact', async () => {
    await request(app)
      .delete('/api/contacts/999999')
      .expect(404);
  });

  it('should return 400 for invalid ID format', async () => {
    await request(app)
      .delete('/api/contacts/invalid-id')
      .expect(400);
  });

  it('should confirm contact is actually removed from database', async () => {
    const contact = await createTestContactInDb();
    
    // Видаляємо контакт
    await request(app)
      .delete(`/api/contacts/${contact.id}`)
      .expect(200);

    // Спробуємо отримати видалений контакт
    const response = await request(app)
      .get(`/api/contacts/${contact.id}`)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Not found');
  });
}); 