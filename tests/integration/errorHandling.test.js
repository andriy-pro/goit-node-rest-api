import request from 'supertest';
import app from '../../src/app.js';
import { NON_EXISTENT_ID, INVALID_ID_FORMAT } from '../helpers/testConstants.js';

describe('Integration: Error Handling', () => {
  it('should return 400 for invalid contact id format on GET', async () => {
    const response = await request(app).get(`/api/contacts/${INVALID_ID_FORMAT}`);
    expect(response.status).toBe(400);
  });
  
  it('should return 404 for not found contact on GET', async () => {
    const response = await request(app).get(`/api/contacts/${NON_EXISTENT_ID}`);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid contact id format on PUT', async () => {
    const response = await request(app)
      .put(`/api/contacts/${INVALID_ID_FORMAT}`)
      .send({ name: 'test', email: 'test@test.com', phone: '+380991234567' });
    expect(response.status).toBe(400);
  });

  it('should return 404 for not found contact on PUT', async () => {
    const response = await request(app)
      .put(`/api/contacts/${NON_EXISTENT_ID}`)
      .send({ name: 'test', email: 'test@test.com', phone: '+380991234567' });
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid contact id format on DELETE', async () => {
    const response = await request(app).delete(`/api/contacts/${INVALID_ID_FORMAT}`);
    expect(response.status).toBe(400);
  });

  it('should return 404 for not found contact on DELETE', async () => {
    const response = await request(app).delete(`/api/contacts/${NON_EXISTENT_ID}`);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid contact id format on PATCH favorite', async () => {
    const response = await request(app).patch(`/api/contacts/${INVALID_ID_FORMAT}/favorite`);
    expect(response.status).toBe(400);
  });

  it('should return 404 for not found contact on PATCH favorite', async () => {
    const response = await request(app)
      .patch(`/api/contacts/${NON_EXISTENT_ID}/favorite`)
      .send({ favorite: true });
    expect(response.status).toBe(404);
  });

  it('should return 400 for empty body on POST', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 400 for invalid email format', async () => {
    const invalidData = {
      name: 'Test User',
      email: 'invalid-email',
      phone: '+380991234567'
    };

    const response = await request(app)
      .post('/api/contacts')
      .send(invalidData)
      .expect(400);

    expect(response.body.message).toContain('valid email');
  });

  it('should return 400 for invalid phone format', async () => {
    const invalidData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890' // without +
    };

    const response = await request(app)
      .post('/api/contacts')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('message');
  });

  it('should return 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent-route')
      .expect(404);

    expect(response.status).toBe(404);
  });

  it('should return 404 for non-existent API endpoints', async () => {
    const response = await request(app)
      .get('/api/contacts/invalid/endpoint')
      .expect(404);

    expect(response.status).toBe(404);
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}') // невалідний JSON
      .expect(400);

    expect(response.status).toBe(400);
  });

  it('should handle missing Content-Type header', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .send('not json data');

    // Express може повернути різні статуси залежно від ситуації
    expect([400, 500].includes(response.status)).toBe(true);
  });
});
