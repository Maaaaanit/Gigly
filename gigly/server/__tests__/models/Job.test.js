const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const Job = require('../../models/Job');
const User = require('../../models/User');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

let clientId;

beforeEach(async () => {
  const client = await User.create({ name: 'Client', email: 'client@test.com', password: 'pass123', role: 'client' });
  clientId = client._id;
});

const validJob = () => ({
  clientId,
  title: 'Build a React App',
  description: 'Need a React developer for 3 months',
  category: 'Web Development',
  type: 'fixed',
});

describe('Job model', () => {
  it('saves a valid job', async () => {
    const job = await Job.create(validJob());
    expect(job._id).toBeDefined();
    expect(job.title).toBe('Build a React App');
  });

  it('applies default status of open', async () => {
    const job = await Job.create(validJob());
    expect(job.status).toBe('open');
  });

  it('applies default duration and experienceLevel', async () => {
    const job = await Job.create(validJob());
    expect(job.duration).toBe('1_to_3_months');
    expect(job.experienceLevel).toBe('intermediate');
  });

  it('initializes proposalCount and views to 0', async () => {
    const job = await Job.create(validJob());
    expect(job.proposalCount).toBe(0);
    expect(job.views).toBe(0);
  });

  it('fails when title is missing', async () => {
    const job = new Job({ clientId, description: 'desc', category: 'Web', type: 'fixed' });
    await expect(job.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails when clientId is missing', async () => {
    const job = new Job({ title: 'Test', description: 'desc', category: 'Web', type: 'fixed' });
    await expect(job.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid type enum', async () => {
    const job = new Job({ ...validJob(), type: 'weekly' });
    await expect(job.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid status enum', async () => {
    const job = new Job({ ...validJob(), status: 'unknown' });
    await expect(job.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid duration enum', async () => {
    const job = new Job({ ...validJob(), duration: 'one_week' });
    await expect(job.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('sets timestamps', async () => {
    const job = await Job.create(validJob());
    expect(job.createdAt).toBeDefined();
    expect(job.updatedAt).toBeDefined();
  });

  it('stores clientId as ObjectId reference', async () => {
    const job = await Job.create(validJob());
    expect(job.clientId.toString()).toBe(clientId.toString());
  });
});
