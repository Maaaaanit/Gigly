const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const { notify } = require('../../utils/notificationHelper');
const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('notificationHelper.notify()', () => {
  const userId = new mongoose.Types.ObjectId();

  it('creates a notification in the database', async () => {
    await notify({ userId, title: 'Test', message: 'Hello', type: 'general' });
    const notification = await Notification.findOne({ userId });
    expect(notification).not.toBeNull();
    expect(notification.title).toBe('Test');
    expect(notification.message).toBe('Hello');
  });

  it('uses default type of general when not provided', async () => {
    await notify({ userId, title: 'T', message: 'M' });
    const notification = await Notification.findOne({ userId });
    expect(notification.type).toBe('general');
  });

  it('stores link and metadata when provided', async () => {
    await notify({ userId, title: 'T', message: 'M', link: '/contracts/123', metadata: { contractId: '123' } });
    const notification = await Notification.findOne({ userId });
    expect(notification.link).toBe('/contracts/123');
    expect(notification.metadata.contractId).toBe('123');
  });

  it('does not throw when notification creation fails', async () => {
    const badId = null;
    await expect(notify({ userId: badId, title: 'T', message: 'M' })).resolves.not.toThrow();
  });

  it('sets isRead default to false', async () => {
    await notify({ userId, title: 'T', message: 'M' });
    const notification = await Notification.findOne({ userId });
    expect(notification.isRead).toBe(false);
  });
});
