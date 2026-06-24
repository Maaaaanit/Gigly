process.env.JWT_SECRET = 'test_jwt_secret_for_tests_only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';

jest.mock('../../utils/emailSender', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  templates: {
    welcome: jest.fn().mockReturnValue({ subject: 'W', html: '' }),
    proposalReceived: jest.fn().mockReturnValue({ subject: 'P', html: '' }),
    contractCreated: jest.fn().mockReturnValue({ subject: 'C', html: '' }),
    paymentReceived: jest.fn().mockReturnValue({ subject: 'Pay', html: '' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'R', html: '' }),
  },
}));

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: `${role}`, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

let clientToken, clientUser, freelancerToken, freelancerUser;

beforeEach(async () => {
  const client = await registerAndLogin('client', 'cont_client@test.com');
  clientToken = client.token;
  clientUser = client.user;

  const freelancer = await registerAndLogin('freelancer', 'cont_fl@test.com');
  freelancerToken = freelancer.token;
  freelancerUser = freelancer.user;
});

const contractPayload = () => ({
  freelancerId: freelancerUser._id,
  title: 'Direct Website Contract',
  description: 'Build a website',
  type: 'fixed',
  totalBudget: 20000,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});

describe('POST /api/contracts', () => {
  it('creates a direct contract as client', async () => {
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(contractPayload());
    expect(res.status).toBe(201);
    expect(res.body.data.contract.title).toBe('Direct Website Contract');
    expect(res.body.data.contract.status).toBe('pending');
  });

  it('returns 403 when freelancer tries to create contract', async () => {
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send(contractPayload());
    expect(res.status).toBe(403);
  });

  it('returns 404 when freelancerId is not a freelancer', async () => {
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ ...contractPayload(), freelancerId: clientUser._id });
    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/contracts').send(contractPayload());
    expect(res.status).toBe(401);
  });
});

describe('GET /api/contracts', () => {
  it('returns contracts for client', async () => {
    await request(app).post('/api/contracts').set('Authorization', `Bearer ${clientToken}`).send(contractPayload());
    const res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contracts.length).toBe(1);
  });

  it('returns contracts for freelancer', async () => {
    await request(app).post('/api/contracts').set('Authorization', `Bearer ${clientToken}`).send(contractPayload());
    const res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contracts.length).toBe(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/contracts');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/contracts/:id', () => {
  let contractId;

  beforeEach(async () => {
    const res = await request(app).post('/api/contracts').set('Authorization', `Bearer ${clientToken}`).send(contractPayload());
    contractId = res.body.data.contract._id;
  });

  it('returns contract for client party', async () => {
    const res = await request(app).get(`/api/contracts/${contractId}`).set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contract._id).toBe(contractId);
  });

  it('returns contract for freelancer party', async () => {
    const res = await request(app).get(`/api/contracts/${contractId}`).set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 403 for third-party user', async () => {
    const { token: thirdToken } = await registerAndLogin('client', 'third@test.com');
    const res = await request(app).get(`/api/contracts/${contractId}`).set('Authorization', `Bearer ${thirdToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent contract', async () => {
    const res = await request(app).get('/api/contracts/507f1f77bcf86cd799439011').set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/contracts/:id/accept', () => {
  let contractId;

  beforeEach(async () => {
    const res = await request(app).post('/api/contracts').set('Authorization', `Bearer ${clientToken}`).send(contractPayload());
    contractId = res.body.data.contract._id;
  });

  it('freelancer accepts contract', async () => {
    const res = await request(app).put(`/api/contracts/${contractId}/accept`).set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.contract.status).toBe('active');
  });

  it('returns 403 when client tries to accept', async () => {
    const res = await request(app).put(`/api/contracts/${contractId}/accept`).set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/contracts/:id/status', () => {
  let contractId;

  beforeEach(async () => {
    const res = await request(app).post('/api/contracts').set('Authorization', `Bearer ${clientToken}`).send(contractPayload());
    contractId = res.body.data.contract._id;
  });

  it('client updates contract status to cancelled', async () => {
    const res = await request(app)
      .put(`/api/contracts/${contractId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(200);
    expect(res.body.data.contract.status).toBe('cancelled');
  });

  it('returns 403 for third-party user', async () => {
    const { token: thirdToken } = await registerAndLogin('client', 'contthird@test.com');
    const res = await request(app)
      .put(`/api/contracts/${contractId}/status`)
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(403);
  });
});
