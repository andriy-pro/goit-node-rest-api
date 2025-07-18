import request from 'supertest';
import app from '../../../src/app.js';
import { createTestContactInDb } from '../../../tests/helpers/testConstants.js';

describe('PUT /api/contacts/:id', () => {
  it('should update an existing contact with status 200', async () => {
    const contact = await createTestContactInDb();
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      favorite: true
    };

    const response = await request(app)
      .put(`/api/contacts/${contact.id}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toBe(updateData.name);
    expect(response.body.email).toBe(updateData.email);
    expect(response.body.phone).toBe(updateData.phone);
    expect(response.body.favorite).toBe(updateData.favorite);
  });

  it('should return 404 for non-existent contact', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233'
    };

    await request(app)
      .put('/api/contacts/999999')
      .send(updateData)
      .expect(404);
  });

  it('should return 400 for invalid ID format', async () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233'
    };

    await request(app)
      .put('/api/contacts/invalid-id')
      .send(updateData)
      .expect(400);
  });

  it('should return 400 for missing required fields', async () => {
    const contact = await createTestContactInDb();
    const updateData = {
      email: 'updated@example.com'
      // missing name and phone
    };

    const response = await request(app)
      .put(`/api/contacts/${contact.id}`)
      .send(updateData)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('name');
  });

  it('should return 400 for invalid email format', async () => {
    const contact = await createTestContactInDb();
    const updateData = {
      name: 'Updated Name',
      email: 'not-an-email',
      phone: '+380991112233'
    };

    const response = await request(app)
      .put(`/api/contacts/${contact.id}`)
      .send(updateData)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('valid email');
  });

  it('should return 400 for invalid phone format', async () => {
    const contact = await createTestContactInDb();
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: 'invalid-phone'
    };

    const response = await request(app)
      .put(`/api/contacts/${contact.id}`)
      .send(updateData)
      .expect(400);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('phone');
  });

  it('should preserve contact structure after update', async () => {
    const contact = await createTestContactInDb();
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+380991112233',
      favorite: true
    };

    const response = await request(app)
      .put(`/api/contacts/${contact.id}`)
      .send(updateData)
      .expect(200);

    // Перевіряємо що всі необхідні поля присутні
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('phone');
    expect(response.body).toHaveProperty('favorite');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });
}); 