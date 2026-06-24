const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const Proposal = require('../../models/Proposal');
const Job = require('../../models/Job');
const User = require('../../models/User');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

let jobId, freelancerId;

beforeEach(async () => {
  const client = await User.create({ name: 'Client', email: 'client@test.com', password: 'pass123', role: 'client' });
  const freelancer = await User.create({ name: 'Freelancer', email: 'fl@test.com', password: 'pass123', role: 'freelancer' });
  freelancerId = freelancer._id;
  const job = await Job.create({ clientId: client._id, title: 'Job', description: 'desc', category: 'Web', type: 'fixed' });
  jobId = job._id;
});

const validProposal = () => ({
  jobId,
  freelancerId,
  coverLetter: 'I am the best candidate for this job.',
  bidAmount: 5000,
  bidType: 'fixed',
});

describe('Proposal model', () => {
  it('saves a valid proposal', async () => {
    const proposal = await Proposal.create(validProposal());
    expect(proposal._id).toBeDefined();
    expect(proposal.status).toBe('pending');
  });

  it('applies default status of pending', async () => {
    const proposal = await Proposal.create(validProposal());
    expect(proposal.status).toBe('pending');
  });

  it('fails when coverLetter is missing', async () => {
    const p = new Proposal({ jobId, freelancerId, bidAmount: 100, bidType: 'fixed' });
    await expect(p.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails when bidAmount is missing', async () => {
    const p = new Proposal({ jobId, freelancerId, coverLetter: 'cover', bidType: 'fixed' });
    await expect(p.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid bidType enum', async () => {
    const p = new Proposal({ ...validProposal(), bidType: 'daily' });
    await expect(p.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails for invalid status enum', async () => {
    const p = new Proposal({ ...validProposal(), status: 'unknown' });
    await expect(p.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('sets timestamps', async () => {
    const proposal = await Proposal.create(validProposal());
    expect(proposal.createdAt).toBeDefined();
  });
});
