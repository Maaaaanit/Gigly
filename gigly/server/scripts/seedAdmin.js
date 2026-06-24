require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [, , nameArg, emailArg, passwordArg] = process.argv;

const name = nameArg || 'Gigly Admin';
const email = emailArg || 'admin@gigly.in';
const password = passwordArg || 'ChangeMe123!';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ email });
  if (user) {
    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log(`Existing user ${email} promoted to admin.`);
    } else {
      console.log(`Admin ${email} already exists. No changes made.`);
    }
  } else {
    user = await User.create({ name, email, password, role: 'admin', isVerified: true });
    console.log(`Admin created: ${email} / ${password}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
