process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn(),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'W', html: '' }),
    proposalReceived: jest.fn().mockReturnValue({ subject: 'P', html: '' }),
    contractCreated: jest.fn().mockReturnValue({ subject: 'C', html: '' }),
    paymentReceived: jest.fn().mockReturnValue({ subject: 'Pay', html: '' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'R', html: '' }),
  },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');

const createAdminAndLogin = async (email) => {
  const user = await User.create({ name: 'Admin', email, password: 'pass123456', role: 'admin' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return { token, user };
};

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: role, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

describe('GET /api/analytics/freelancer', () => {
  it('returns freelancer stats', async () => {
    const { token } = await registerAndLogin('freelancer', 'anfl@test.com');
    const res = await request(app).get('/api/analytics/freelancer').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('activeContracts');
    expect(res.body.data).toHaveProperty('totalEarnings');
    expect(res.body.data).toHaveProperty('pendingInvoices');
  });

  it('returns 403 for client user', async () => {
    const { token } = await registerAndLogin('client', 'ancl@test.com');
    const res = await request(app).get('/api/analytics/freelancer').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/analytics/freelancer');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/analytics/client', () => {
  it('returns client stats', async () => {
    const { token } = await registerAndLogin('client', 'anclient2@test.com');
    const res = await request(app).get('/api/analytics/client').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('activeContracts');
    expect(res.body.data).toHaveProperty('totalSpend');
    expect(res.body.data).toHaveProperty('activeJobs');
  });

  it('returns 403 for freelancer user', async () => {
    const { token } = await registerAndLogin('freelancer', 'anfl2@test.com');
    const res = await request(app).get('/api/analytics/client').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/analytics/admin', () => {
  it('returns admin stats', async () => {
    const { token } = await createAdminAndLogin('anadmin@test.com');
    const res = await request(app).get('/api/analytics/admin').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalJobs');
    expect(res.body.data).toHaveProperty('totalRevenue');
  });

  it('returns 403 for client user', async () => {
    const { token } = await registerAndLogin('client', 'anadmintest@test.com');
    const res = await request(app).get('/api/analytics/admin').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
