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
const Contract = require('../../models/Contract');
const mongoose = require('mongoose');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (role, email) => {
  await request(app).post('/api/auth/register').send({ name: role, email, password: 'pass123456', role });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

let clientToken, clientUser, freelancerUser, completedContractId;

beforeEach(async () => {
  const client = await registerAndLogin('client', 'rev_client@test.com');
  clientToken = client.token;
  clientUser = client.user;
  const freelancer = await registerAndLogin('freelancer', 'rev_fl@test.com');
  freelancerUser = freelancer.user;

  const contractRes = await request(app)
    .post('/api/contracts')
    .set('Authorization', `Bearer ${clientToken}`)
    .send({
      freelancerId: freelancerUser._id,
      title: 'Rev Contract',
      type: 'fixed',
      totalBudget: 5000,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  const contractId = contractRes.body.data.contract._id;
  await Contract.findByIdAndUpdate(contractId, { status: 'completed' });
  completedContractId = contractId;
});

describe('POST /api/reviews', () => {
  it('creates review for a completed contract', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: completedContractId, rating: 5, comment: 'Great work!', type: 'client_to_freelancer' });
    expect(res.status).toBe(201);
    expect(res.body.data.review.rating).toBe(5);
  });

  it('returns 400 if contract is not completed', async () => {
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        freelancerId: freelancerUser._id,
        title: 'Pending Contract',
        type: 'fixed',
        totalBudget: 5000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    const pendingContractId = contractRes.body.data.contract._id;

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: pendingContractId, rating: 4, comment: 'OK', type: 'client_to_freelancer' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when reviewing same contract twice', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: completedContractId, rating: 5, comment: 'Great!', type: 'client_to_freelancer' });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: completedContractId, rating: 3, comment: 'Changed mind', type: 'client_to_freelancer' });
    expect(res.status).toBe(400);
  });

  it('returns 403 for third-party user', async () => {
    const { token: thirdToken } = await registerAndLogin('client', 'rev_third@test.com');
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ contractId: completedContractId, rating: 1, comment: 'Fake', type: 'client_to_freelancer' });
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/reviews').send({ contractId: completedContractId, rating: 5, comment: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/reviews/freelancer/:freelancerId', () => {
  it('returns reviews for a freelancer', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ contractId: completedContractId, rating: 5, comment: 'Great!', type: 'client_to_freelancer' });

    const res = await request(app).get(`/api/reviews/freelancer/${freelancerUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.reviews.length).toBe(1);
    expect(res.body.data.reviews[0].rating).toBe(5);
  });

  it('returns empty array for freelancer with no reviews', async () => {
    const res = await request(app).get(`/api/reviews/freelancer/${freelancerUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.reviews).toHaveLength(0);
  });
});
