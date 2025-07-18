import request from 'supertest';
import app from '../../../src/app.js';
import { createTestContactInDb } from '../../../tests/helpers/testConstants.js';

describe('PATCH /api/contacts/:id/favorite', () => {
  it('should update favorite status to true for an existing contact', async () => {
    const contact = await createTestContactInDb();
    
    const response = await request(app)
      .patch(`/api/contacts/${contact.id}/favorite`)
      .send({ favorite: true })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id', contact.id);
    expect(response.body.favorite).toBe(true);
  });

  it('should update favorite status to false for an existing contact', async () => {
    const contact = await createTestContactInDb({ favorite: true });
    
    const response = await request(app)
      .patch(`/api/contacts/${contact.id}/favorite`)
      .send({ favorite: false })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('id', contact.id);
    expect(response.body.favorite).toBe(false);
  });

  it('should preserve all other fields when updating favorite', async () => {
    const contact = await createTestContactInDb();
    const originalData = { ...contact.get({ plain: true }) };

    const response = await request(app)
      .patch(`/api/contacts/${contact.id}/favorite`)
      .send({ favorite: true })
      .expect(200);

    // Перевіряємо що інші поля не змінилися
    expect(response.body.name).toBe(originalData.name);
    expect(response.body.email).toBe(originalData.email);
    expect(response.body.phone).toBe(originalData.phone);
    expect(response.body.favorite).toBe(true); // це поле змінилося
  });

  it('should return 404 for non-existent contact', async () => {
    await request(app)
      .patch('/api/contacts/999999/favorite')
      .send({ favorite: true })
      .expect(404);
  });

  it('should return 400 for invalid ID format', async () => {
    await request(app)
      .patch('/api/contacts/invalid-id/favorite')
      .send({ favorite: true })
      .expect(400);
  });

  describe('Validation errors', () => {
    it('should return 400 for missing favorite field', async () => {
      const contact = await createTestContactInDb();
      
      const response = await request(app)
        .patch(`/api/contacts/${contact.id}/favorite`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/favorite/i);
    });

    it('should return 400 for non-boolean favorite value', async () => {
      const contact = await createTestContactInDb();
      
      const response = await request(app)
        .patch(`/api/contacts/${contact.id}/favorite`)
        .send({ favorite: 'not-boolean' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/boolean/i);
    });

    it('should return 400 for null favorite value', async () => {
      const contact = await createTestContactInDb();
      
      const response = await request(app)
        .patch(`/api/contacts/${contact.id}/favorite`)
        .send({ favorite: null })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/boolean/i);
    });

    it('should return 400 for undefined favorite value', async () => {
      const contact = await createTestContactInDb();
      
      const response = await request(app)
        .patch(`/api/contacts/${contact.id}/favorite`)
        .send({ favorite: undefined })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/boolean/i);
    });
  });

  it('should handle boolean false correctly (not treat as falsy)', async () => {
    const contact = await createTestContactInDb({ favorite: true });
    
    const response = await request(app)
      .patch(`/api/contacts/${contact.id}/favorite`)
      .send({ favorite: false })
      .expect(200);

    expect(response.body.favorite).toBe(false);
    expect(typeof response.body.favorite).toBe('boolean');
  });
}); 