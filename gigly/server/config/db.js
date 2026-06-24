const dns = require('dns');
const mongoose = require('mongoose');

if (process.env.MONGODB_URI?.includes('mongodb+srv')) {
  // Node's default DNS resolver can fail SRV lookups on some networks/machines
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
