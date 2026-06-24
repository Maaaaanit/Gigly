const mongoose = require('mongoose');
const { connectDB, disconnectDB, clearDB } = require('../helpers/db');
const User = require('../../models/User');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await disconnectDB());

describe('User model', () => {
  const validUser = { name: 'Manit Test', email: 'manit@test.com', password: 'password123', role: 'freelancer' };

  it('saves a valid user with hashed password', async () => {
    const user = await User.create(validUser);
    expect(user._id).toBeDefined();
    expect(user.email).toBe('manit@test.com');
    expect(user.name).toBe('Manit Test');
  });

  it('hashes password before saving', async () => {
    const user = await User.findOne({ email: validUser.email }).select('+password')
      || await User.create(validUser);
    const saved = await User.findOne({ email: validUser.email }).select('+password');
    expect(saved.password).not.toBe('password123');
    expect(saved.password).toMatch(/^\$2[ab]\$/);
  });

  it('comparePassword returns true for correct password', async () => {
    const user = await User.create(validUser);
    const found = await User.findById(user._id).select('+password');
    const match = await found.comparePassword('password123');
    expect(match).toBe(true);
  });

  it('comparePassword returns false for wrong password', async () => {
    const user = await User.create(validUser);
    const found = await User.findById(user._id).select('+password');
    const match = await found.comparePassword('wrongpassword');
    expect(match).toBe(false);
  });

  it('applies default values (isActive, isVerified, avatar)', async () => {
    const user = await User.create(validUser);
    expect(user.isActive).toBe(true);
    expect(user.isVerified).toBe(false);
    expect(user.avatar).toBeNull();
  });

  it('sets timestamps on create', async () => {
    const user = await User.create(validUser);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('fails validation when name is missing', async () => {
    const user = new User({ email: 'a@test.com', password: 'pass123', role: 'client' });
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails validation when email is missing', async () => {
    const user = new User({ name: 'Test', password: 'pass123', role: 'client' });
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('fails validation when role is invalid enum value', async () => {
    const user = new User({ name: 'Test', email: 'b@test.com', password: 'pass123', role: 'superadmin' });
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('enforces unique email constraint', async () => {
    await User.create(validUser);
    const duplicate = new User({ name: 'Other', email: 'manit@test.com', password: 'pass123', role: 'client' });
    await expect(duplicate.save()).rejects.toMatchObject({ code: 11000 });
  });

  it('lowercases email on save', async () => {
    const user = await User.create({ ...validUser, email: 'UPPER@TEST.COM' });
    expect(user.email).toBe('upper@test.com');
  });

  it('toJSON strips password, resetPasswordToken, resetPasswordExpires', async () => {
    const user = await User.create(validUser);
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(json.resetPasswordToken).toBeUndefined();
    expect(json.resetPasswordExpires).toBeUndefined();
  });

  it('accepts all valid role enum values', async () => {
    const roles = ['freelancer', 'client', 'admin'];
    for (const [i, role] of roles.entries()) {
      const u = await User.create({ name: `User${i}`, email: `user${i}@test.com`, password: 'pass123', role });
      expect(u.role).toBe(role);
    }
  });
});
