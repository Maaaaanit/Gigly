process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';

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

jest.mock('../../utils/pdfGenerator', () => ({
  generateInvoicePDF: jest.fn().mockResolvedValue('/uploads/invoices/test-invoice.pdf'),
}));

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const Contract = require('../../models/Contract');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: role, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

let clientToken, freelancerToken, activeContractId, milestoneId;

beforeEach(async () => {
  const client = await registerAndLogin('client', 'ms_client@test.com');
  clientToken = client.token;
  const freelancer = await registerAndLogin('freelancer', 'ms_fl@test.com');
  freelancerToken = freelancer.token;

  const contractRes = await request(app)
    .post('/api/contracts')
    .set('Authorization', `Bearer ${clientToken}`)
    .send({
      freelancerId: freelancer.user._id,
      title: 'Milestone Contract',
      type: 'fixed',
      totalBudget: 10000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  const contractId = contractRes.body.data.contract._id;
  await Contract.findByIdAndUpdate(contractId, { status: 'active' });
  activeContractId = contractId;
});

describe('POST /api/milestones', () => {
  it('creates a milestone as client on active contract', async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: activeContractId, title: 'Design Phase', amount: 3000, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    expect(res.status).toBe(201);
    expect(res.body.data.milestone.title).toBe('Design Phase');
    milestoneId = res.body.data.milestone._id;
  });

  it('returns 403 for freelancer', async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ contractId: activeContractId, title: 'Test', amount: 1000, dueDate: new Date() });
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent or unauthorized contract', async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: '507f1f77bcf86cd799439011', title: 'Test', amount: 1000, dueDate: new Date() });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/milestones/contract/:contractId', () => {
  it('returns milestones for a contract', async () => {
    await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: activeContractId, title: 'Phase 1', amount: 2000, dueDate: new Date() });

    const res = await request(app)
      .get(`/api/milestones/contract/${activeContractId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.milestones.length).toBe(1);
  });
});

describe('Milestone submit / approve / reject flow', () => {
  beforeEach(async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: activeContractId, title: 'Dev Phase', amount: 5000, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    milestoneId = res.body.data.milestone._id;
  });

  it('freelancer submits a milestone', async () => {
    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/submit`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ submissionNote: 'Work is done' });
    expect(res.status).toBe(200);
    expect(res.body.data.milestone.status).toBe('submitted');
  });

  it('client rejects a submitted milestone', async () => {
    await request(app)
      .put(`/api/milestones/${milestoneId}/submit`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ submissionNote: 'Done' });

    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/reject`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ rejectionRemark: 'Not up to standard' });
    expect(res.status).toBe(200);
    expect(res.body.data.milestone.status).toBe('rejected');
  });

  it('returns 400 when rejecting without remark', async () => {
    await request(app)
      .put(`/api/milestones/${milestoneId}/submit`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ submissionNote: 'Done' });

    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/reject`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('client approves a submitted milestone and generates invoice', async () => {
    await request(app)
      .put(`/api/milestones/${milestoneId}/submit`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ submissionNote: 'Done' });

    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/approve`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.invoice).toBeDefined();
    expect(res.body.data.milestone.status).toBe('paid');
  });

  it('returns 400 when approving a non-submitted milestone', async () => {
    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/approve`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(400);
  });

  it('returns 403 when non-client tries to approve', async () => {
    await request(app)
      .put(`/api/milestones/${milestoneId}/submit`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ submissionNote: 'Done' });

    const res = await request(app)
      .put(`/api/milestones/${milestoneId}/approve`)
      .set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(403);
  });
});
