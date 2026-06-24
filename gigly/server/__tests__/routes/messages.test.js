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

const request = require('supertest');
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: role, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

let clientToken, freelancerToken, contractId;

beforeEach(async () => {
  const client = await registerAndLogin('client', 'msg_client@test.com');
  clientToken = client.token;
  const freelancer = await registerAndLogin('freelancer', 'msg_fl@test.com');
  freelancerToken = freelancer.token;

  const contractRes = await request(app)
    .post('/api/contracts')
    .set('Authorization', `Bearer ${clientToken}`)
    .send({
      freelancerId: freelancer.user._id,
      title: 'Msg Contract',
      type: 'fixed',
      totalBudget: 5000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  contractId = contractRes.body.data.contract._id;
});

describe('POST /api/messages/:contractId', () => {
  it('client sends a message in the contract', async () => {
    const res = await request(app)
      .post(`/api/messages/${contractId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ content: 'Hello from client!' });
    expect(res.status).toBe(201);
    expect(res.body.data.message.content).toBe('Hello from client!');
  });

  it('freelancer sends a message in the contract', async () => {
    const res = await request(app)
      .post(`/api/messages/${contractId}`)
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ content: 'Hello from freelancer!' });
    expect(res.status).toBe(201);
  });

  it('returns 403 when third party tries to send message', async () => {
    const { token: thirdToken } = await registerAndLogin('client', 'msg_third@test.com');
    const res = await request(app)
      .post(`/api/messages/${contractId}`)
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ content: 'Intruder!' });
    expect(res.status).toBe(403);
  });

  it('returns 404 when contract does not exist', async () => {
    const res = await request(app)
      .post('/api/messages/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ content: 'test' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/messages/:contractId', () => {
  it('returns messages for contract parties', async () => {
    await request(app)
      .post(`/api/messages/${contractId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ content: 'First message' });

    const res = await request(app)
      .get(`/api/messages/${contractId}`)
      .set('Authorization', `Bearer ${freelancerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.messages).toBeInstanceOf(Array);
    expect(res.body.data.messages.length).toBe(1);
  });

  it('returns 403 for non-party user', async () => {
    const { token: thirdToken } = await registerAndLogin('client', 'msg_third2@test.com');
    const res = await request(app).get(`/api/messages/${contractId}`).set('Authorization', `Bearer ${thirdToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/messages/unread', () => {
  it('returns unread count for authenticated user', async () => {
    const res = await request(app).get('/api/messages/unread').set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('count');
    expect(typeof res.body.data.count).toBe('number');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/messages/unread');
    expect(res.status).toBe(401);
  });
});
