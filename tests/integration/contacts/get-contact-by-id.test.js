import request from 'supertest';
import app from '../../../src/app.js';
import { createTestContactInDb } from '../../../tests/helpers/testConstants.js';

describe('GET /api/contacts/:id', () => {
  it('should return a contact by valid ID', async () => {
    const contact = await createTestContactInDb();
    
    const response = await request(app)
      .get(`/api/contacts/${contact.id}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', contact.id);
  });

  it('should return 404 for non-existent contact', async () => {
    await request(app)
      .get('/api/contacts/999999')
      .expect(404);
  });

  it('should return 400 for invalid ID format', async () => {
    await request(app)
      .get('/api/contacts/invalid-id')
      .expect(400);
  });

  it('should return 400 for zero ID', async () => {
    const response = await request(app)
      .get('/api/contacts/0')
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid ID format');
  });

  it('should return 400 for negative ID', async () => {
    const response = await request(app)
      .get('/api/contacts/-1')
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid ID format');
  });

  it('should return 400 for ID with non-numeric characters', async () => {
    const response = await request(app)
      .get('/api/contacts/abc')
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid ID format');
  });
}); 