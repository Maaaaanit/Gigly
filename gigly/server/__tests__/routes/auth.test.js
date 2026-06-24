process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'Welcome', html: '<p>Welcome</p>' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'Reset', html: '<p>Reset</p>' }),
    proposalReceived: jest.fn().mockReturnValue({ subject: 'Proposal', html: '<p>Proposal</p>' }),
    contractCreated: jest.fn().mockReturnValue({ subject: 'Contract', html: '<p>Contract</p>' }),
    paymentReceived: jest.fn().mockReturnValue({ subject: 'Payment', html: '<p>Payment</p>' }),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const User = require('../../models/User');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('POST /api/auth/register', () => {
  const validPayload = {
    name: 'Test User',
    email: 'test@gigly.com',
    password: 'password123',
    role: 'freelancer',
  };

  it('registers a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('test@gigly.com');
  });

  it('returns 400 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when email is invalid (validation)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPayload, password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when role is invalid', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPayload, role: 'superadmin' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: 'pass123', role: 'client' });
    expect(res.status).toBe(400);
  });

  it('creates a client user without a freelancer profile', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validPayload, email: 'client@gigly.com', role: 'client' });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@gigly.com',
      password: 'password123',
      role: 'client',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@gigly.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('login@gigly.com');
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@gigly.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@gigly.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when email is missing (validation)', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when user isActive is false', async () => {
    await User.findOneAndUpdate({ email: 'login@gigly.com' }, { isActive: false });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@gigly.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Me User',
      email: 'me@gigly.com',
      password: 'password123',
      role: 'client',
    });
    token = res.body.data.token;
  });

  it('returns current user when authenticated', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@gigly.com');
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/password', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'PW User',
      email: 'pw@gigly.com',
      password: 'oldpassword',
      role: 'client',
    });
    token = res.body.data.token;
  });

  it('updates password with correct current password', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword', newPassword: 'newpassword123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 with incorrect current password', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/auth/password').send({ currentPassword: 'old', newPassword: 'new' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Forgot User',
      email: 'forgot@gigly.com',
      password: 'password123',
      role: 'client',
    });
  });

  it('returns 200 when email exists', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'forgot@gigly.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when email does not exist', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@gigly.com' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when email is invalid format', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});
