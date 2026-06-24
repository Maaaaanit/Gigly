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
const app = require('../../app');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

const registerAndLogin = async (email = 'notif@test.com') => {
  await request(app).post('/api/auth/register').send({ name: 'Notif User', email, password: 'pass123456', role: 'client' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123456' });
  return { token: res.body.data.token, user: res.body.data.user };
};

describe('GET /api/notifications', () => {
  it('returns notifications for authenticated user', async () => {
    const { token, user } = await registerAndLogin();
    await Notification.create({ userId: user._id, title: 'Test', message: 'Msg', type: 'general' });

    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.notifications.length).toBe(1);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('returns empty array when no notifications', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toHaveLength(0);
    expect(res.body.data.unreadCount).toBe(0);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notifications/:id/read', () => {
  it('marks a notification as read', async () => {
    const { token, user } = await registerAndLogin();
    const notification = await Notification.create({ userId: user._id, title: 'T', message: 'M', type: 'general' });

    const res = await request(app)
      .put(`/api/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await Notification.findById(notification._id);
    expect(updated.isRead).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/notifications/507f1f77bcf86cd799439011/read');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notifications/read-all', () => {
  it('marks all notifications as read', async () => {
    const { token, user } = await registerAndLogin();
    await Notification.create([
      { userId: user._id, title: 'T1', message: 'M1', type: 'general' },
      { userId: user._id, title: 'T2', message: 'M2', type: 'general' },
    ]);

    const res = await request(app).put('/api/notifications/read-all').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const unread = await Notification.countDocuments({ userId: user._id, isRead: false });
    expect(unread).toBe(0);
  });
});
