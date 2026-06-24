process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'Welcome', html: '' }),
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

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: `${role} User`, email, password: 'pass123456', role });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: loginRes.body.data.token, user: loginRes.body.data.user };
};

let clientToken, freelancerToken, jobId;

beforeEach(async () => {
  const client = await registerAndLogin('client', 'propclient@test.com');
  const freelancer = await registerAndLogin('freelancer', 'propfl@test.com');
  clientToken = client.token;
  freelancerToken = freelancer.token;

  const jobRes = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${clientToken}`)
    .send({ title: 'Test Job', description: 'Need help', category: 'Web Development', type: 'fixed' });
  jobId = jobRes.body.data.job._id;
});

const validProposal = {
  coverLetter: 'I am highly skilled and ready to help.',
  bidAmount: 5000,
  bidType: 'fixed',
  estimatedDuration: '1_month',
};

describe('POST /api/jobs/:jobId/proposals', () => {
  it('submits a proposal as freelancer', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/proposals`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send(validProposal);
    expect(res.status).toBe(201);
    expect(res.body.data.proposal).toBeDefined();
  });

  it('returns 400 when proposal already submitted for same job', async () => {
    await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    const res = await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    expect(res.status).toBe(400);
  });

  it('returns 403 when client tries to submit proposal', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/proposals`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(validProposal);
    expect(res.status).toBe(403);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/proposals`).send(validProposal);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent job', async () => {
    const fakeJobId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .post(`/api/jobs/${fakeJobId}/proposals`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send(validProposal);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/proposals/my', () => {
  it('returns freelancer own proposals', async () => {
    await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    const res = await request(app).get('/api/proposals/my').set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.proposals).toBeInstanceOf(Array);
    expect(res.body.data.proposals.length).toBe(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/proposals/my');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/proposals/:id/withdraw', () => {
  let proposalId;

  beforeEach(async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    proposalId = res.body.data.proposal._id;
  });

  it('withdraws a pending proposal', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/withdraw`).set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.proposal.status).toBe('withdrawn');
  });

  it('returns 404 when proposal not found or belongs to another user', async () => {
    const { token: anotherFL } = await registerAndLogin('freelancer', 'anotherfl@test.com');
    const res = await request(app).put(`/api/proposals/${proposalId}/withdraw`).set('Authorization', `Bearer ${anotherFL}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/proposals/:id/accept', () => {
  let proposalId;

  beforeEach(async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    proposalId = res.body.data.proposal._id;
  });

  it('accepts a proposal as client and creates contract', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/accept`).set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contract).toBeDefined();
    expect(res.body.data.proposal.status).toBe('accepted');
  });

  it('returns 403 when freelancer tries to accept proposal', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/accept`).set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/accept`);
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/proposals/:id/reject', () => {
  let proposalId;

  beforeEach(async () => {
    const res = await request(app).post(`/api/jobs/${jobId}/proposals`).set('Authorization', `Bearer ${freelancerToken}`).send(validProposal);
    proposalId = res.body.data.proposal._id;
  });

  it('rejects a proposal as client', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/reject`).set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.proposal.status).toBe('rejected');
  });

  it('returns 403 when freelancer tries to reject', async () => {
    const res = await request(app).put(`/api/proposals/${proposalId}/reject`).set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(403);
  });
});
