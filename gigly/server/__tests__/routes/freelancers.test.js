process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn(),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'W', html: '' }),
    contractCreated: jest.fn().mockReturnValue({ subject: 'C', html: '' }),
    proposalReceived: jest.fn().mockReturnValue({ subject: 'P', html: '' }),
    paymentReceived: jest.fn().mockReturnValue({ subject: 'Pay', html: '' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'R', html: '' }),
  },
}));

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const FreelancerProfile = require('../../models/FreelancerProfile');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: role, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

describe('GET /api/freelancers/browse', () => {
  it('returns list of freelancer profiles', async () => {
    await registerAndLogin('freelancer', 'brfl@test.com');
    const res = await request(app).get('/api/freelancers/browse');
    expect(res.status).toBe(200);
    expect(res.body.data.profiles).toBeInstanceOf(Array);
  });

  it('returns pagination metadata', async () => {
    const res = await request(app).get('/api/freelancers/browse');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('pages');
  });

  it('filters by category', async () => {
    const { user } = await registerAndLogin('freelancer', 'brfl2@test.com');
    await FreelancerProfile.findOneAndUpdate({ userId: user._id }, { category: 'Web Development' });

    const res = await request(app).get('/api/freelancers/browse?category=Web+Development');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/freelancers/categories', () => {
  it('returns distinct categories', async () => {
    const { user } = await registerAndLogin('freelancer', 'catfl@test.com');
    await FreelancerProfile.findOneAndUpdate({ userId: user._id }, { category: 'Web Development' });

    const res = await request(app).get('/api/freelancers/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toBeInstanceOf(Array);
  });
});

describe('GET /api/freelancers/me', () => {
  it('returns freelancer own profile', async () => {
    const { token } = await registerAndLogin('freelancer', 'mefl@test.com');
    const res = await request(app).get('/api/freelancers/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.profile).toBeDefined();
  });

  it('returns 403 for client user', async () => {
    const { token } = await registerAndLogin('client', 'mecl@test.com');
    const res = await request(app).get('/api/freelancers/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/freelancers/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/freelancers/:userId', () => {
  it('returns a freelancer profile by userId', async () => {
    const { user } = await registerAndLogin('freelancer', 'proffl@test.com');
    const res = await request(app).get(`/api/freelancers/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.profile).toBeDefined();
  });

  it('returns 404 for non-existent userId', async () => {
    const res = await request(app).get('/api/freelancers/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/freelancers/:userId', () => {
  it('freelancer updates own profile', async () => {
    const { token, user } = await registerAndLogin('freelancer', 'updfl@test.com');
    const res = await request(app)
      .put(`/api/freelancers/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Full Stack Developer', bio: 'I build things' });
    expect(res.status).toBe(200);
    expect(res.body.data.profile.title).toBe('Full Stack Developer');
  });

  it('returns 403 when other freelancer tries to update profile', async () => {
    const { user: user1 } = await registerAndLogin('freelancer', 'fl1@test.com');
    const { token: token2 } = await registerAndLogin('freelancer', 'fl2@test.com');
    const res = await request(app)
      .put(`/api/freelancers/${user1._id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: 'Hacked' });
    expect(res.status).toBe(403);
  });
});
