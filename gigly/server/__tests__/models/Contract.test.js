const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const Contract = require('../../models/Contract');
const User = require('../../models/User');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

let clientId, freelancerId;

beforeEach(async () => {
  const client = await User.create({ name: 'Client', email: 'client@test.com', password: 'pass123', role: 'client' });
  const freelancer = await User.create({ name: 'FL', email: 'fl@test.com', password: 'pass123', role: 'freelancer' });
  clientId = client._id;
  freelancerId = freelancer._id;
});

const validContract = () => ({
  title: 'Website Redesign',
  clientId,
  freelancerId,
  type: 'fixed',
  totalBudget: 10000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

describe('Contract model', () => {
  it('saves a valid contract', async () => {
    const contract = await Contract.create(validContract());
    expect(contract._id).toBeDefined();
    expect(contract.title).toBe('Website Redesign');
  });

  it('applies default status of pending', async () => {
    const contract = await Contract.create(validContract());
    expect(contract.status).toBe('pending');
  });

  it('applies default amountPaid of 0', async () => {
    const contract = await Contract.create(validContract());
    expect(contract.amountPaid).toBe(0);
  });

  it('virtual remainingBudget = totalBudget - amountPaid', async () => {
    const contract = await Contract.create({ ...validContract(), totalBudget: 10000, amountPaid: 3000 });
    expect(contract.remainingBudget).toBe(7000);
  });

  it('virtual spendPercentage computes correctly', async () => {
    const contract = await Contract.create({ ...validContract(), totalBudget: 10000, amountPaid: 2500 });
    expect(contract.spendPercentage).toBe(25);
  });

  it('virtual spendPercentage is 0 when totalBudget is 0', async () => {
    const contract = new Contract({ ...validContract(), totalBudget: 0, amountPaid: 0 });
    expect(contract.spendPercentage).toBe(0);
  });

  it('fails when title is missing', async () => {
    const c = new Contract({ clientId, freelancerId, type: 'fixed', totalBudget: 100, startDate: new Date(), endDate: new Date() });
    await expect(c.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid status enum', async () => {
    const c = new Contract({ ...validContract(), status: 'unknown' });
    await expect(c.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid type enum', async () => {
    const c = new Contract({ ...validContract(), type: 'weekly' });
    await expect(c.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('sets timestamps', async () => {
    const contract = await Contract.create(validContract());
    expect(contract.createdAt).toBeDefined();
  });

  it('includes virtuals in toJSON output', async () => {
    const contract = await Contract.create({ ...validContract(), totalBudget: 1000, amountPaid: 200 });
    const json = contract.toJSON();
    expect(json.remainingBudget).toBe(800);
    expect(json.spendPercentage).toBe(20);
  });
});
