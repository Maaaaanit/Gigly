process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'Welcome', html: '<p>Welcome</p>' }),
    proposalReceived: jest.fn().mockReturnValue({ subject: 'Proposal', html: '' }),
    contractCreated: jest.fn().mockReturnValue({ subject: 'Contract', html: '' }),
    paymentReceived: jest.fn().mockReturnValue({ subject: 'Payment', html: '' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'Reset', html: '' }),
  },
}));

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email = null) => {
  const emailAddr = email || `${role}_${Date.now()}@test.com`;
  await request(app).post('/api/auth/register').send({ name: `${role} User`, email: emailAddr, password: 'pass123456', role });
  const loginRes = await request(app).post('/api/auth/login').send({ email: emailAddr, password: 'pass123456' });
  return { token: loginRes.body.data.token, user: loginRes.body.data.user };
};

const validJob = {
  title: 'Build a Landing Page',
  description: 'We need a modern landing page',
  category: 'Web Development',
  type: 'fixed',
  budget: { min: 5000, max: 15000 },
};

describe('POST /api/jobs', () => {
  it('creates a job as client', async () => {
    const { token } = await registerAndLogin('client');
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(validJob);
    expect(res.status).toBe(201);
    expect(res.body.data.job.title).toBe('Build a Landing Page');
  });

  it('returns 403 when freelancer tries to post a job', async () => {
    const { token } = await registerAndLogin('freelancer');
    const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(validJob);
    expect(res.status).toBe(403);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/jobs').send(validJob);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/jobs', () => {
  let clientToken;

  beforeEach(async () => {
    const { token } = await registerAndLogin('client', 'jobclient@test.com');
    clientToken = token;
    await request(app).post('/api/jobs').set('Authorization', `Bearer ${clientToken}`).send(validJob);
  });

  it('returns list of open jobs without authentication', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toBeInstanceOf(Array);
    expect(res.body.data.jobs.length).toBeGreaterThan(0);
  });

  it('filters jobs by category', async () => {
    const res = await request(app).get('/api/jobs?category=Web+Development');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.every((j) => /web development/i.test(j.category))).toBe(true);
  });

  it('filters jobs by type', async () => {
    const res = await request(app).get('/api/jobs?type=fixed');
    expect(res.status).toBe(200);
    res.body.data.jobs.forEach((j) => expect(j.type).toBe('fixed'));
  });

  it('returns pagination metadata', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('pages');
  });

  it('searches jobs by keyword', async () => {
    const res = await request(app).get('/api/jobs?search=Landing');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.some((j) => /landing/i.test(j.title))).toBe(true);
  });
});

describe('GET /api/jobs/:id', () => {
  let jobId, clientToken;

  beforeEach(async () => {
    const { token } = await registerAndLogin('client', 'gjclient@test.com');
    clientToken = token;
    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${clientToken}`).send(validJob);
    jobId = jobRes.body.data.job._id;
  });

  it('returns job details', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.job._id).toBe(jobId);
  });

  it('increments view count on fetch', async () => {
    await request(app).get(`/api/jobs/${jobId}`);
    const res = await request(app).get(`/api/jobs/${jobId}`);
    expect(res.body.data.job.views).toBeGreaterThanOrEqual(1);
  });

  it('returns 404 for non-existent job id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/jobs/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id', () => {
  let jobId, clientToken;

  beforeEach(async () => {
    const { token } = await registerAndLogin('client', 'updateclient@test.com');
    clientToken = token;
    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${clientToken}`).send(validJob);
    jobId = jobRes.body.data.job._id;
  });

  it('updates job as owning client', async () => {
    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.job.title).toBe('Updated Title');
  });

  it('returns 404 when another client tries to update', async () => {
    const { token: otherToken } = await registerAndLogin('client', 'other@test.com');
    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijacked' });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/jobs/:id/close', () => {
  let jobId, clientToken;

  beforeEach(async () => {
    const { token } = await registerAndLogin('client', 'closeclient@test.com');
    clientToken = token;
    const jobRes = await request(app).post('/api/jobs').set('Authorization', `Bearer ${clientToken}`).send(validJob);
    jobId = jobRes.body.data.job._id;
  });

  it('closes job as owning client', async () => {
    const res = await request(app).put(`/api/jobs/${jobId}/close`).set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.job.status).toBe('closed');
  });

  it('returns 404 when job not found or unauthorized', async () => {
    const { token: otherToken } = await registerAndLogin('client', 'closeother@test.com');
    const res = await request(app).put(`/api/jobs/${jobId}/close`).set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/jobs/my', () => {
  it('returns only jobs belonging to authenticated client', async () => {
    const { token } = await registerAndLogin('client', 'myclient@test.com');
    await request(app).post('/api/jobs').set('Authorization', `Bearer ${token}`).send(validJob);
    const res = await request(app).get('/api/jobs/my').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toBeInstanceOf(Array);
    expect(res.body.data.jobs.length).toBe(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/jobs/my');
    expect(res.status).toBe(401);
  });
});
