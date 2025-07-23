import request from 'supertest';
import express from 'express';

import validateId from '../../src/middlewares/validateId.js';
import errorHandler from '../../src/middlewares/errorHandler.js';
import { INVALID_ID_FORMAT } from '../helpers/testConstants.js';

const app = express();

app.get('/test/:id', validateId, (req, res) => {
  res.status(200).json({ id: req.params.id });
});

app.use(errorHandler);

describe('Middleware: validateId', () => {
  it('should pass for valid numeric id', async () => {
    const response = await request(app).get('/test/123');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('123');
  });

  it('should fail for non-numeric id', async () => {
    const response = await request(app).get('/test/abc');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('is not a valid ID');
  });

  it('should fail for zero or negative id', async () => {
    const response = await request(app).get('/test/0');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('is not a valid ID');

    const response2 = await request(app).get('/test/-5');
    expect(response2.status).toBe(400);
    expect(response2.body.message).toContain('is not a valid ID');
  });

  it('should fail for id with extra characters', async () => {
    const response = await request(app).get(`/test/${INVALID_ID_FORMAT}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('is not a valid ID');
  });
});
