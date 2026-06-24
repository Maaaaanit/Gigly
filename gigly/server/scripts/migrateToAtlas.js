// One-off migration: copies every collection from local MongoDB into Atlas.
// Usage: node scripts/migrateToAtlas.js
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Node's default resolver fails SRV lookups on this machine

const { MongoClient } = require('mongodb');

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/gigly';
const ATLAS_URI = process.env.MONGODB_URI;

async function run() {
  if (!ATLAS_URI || !ATLAS_URI.includes('mongodb+srv')) {
    throw new Error('MONGODB_URI in .env must be set to your Atlas connection string before running this script.');
  }

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  await localClient.connect();
  await atlasClient.connect();

  const localDb = localClient.db();
  const atlasDb = atlasClient.db('gigly');

  console.log(`Source: ${localDb.databaseName} (local)`);
  console.log(`Target: ${atlasDb.databaseName} (Atlas)\n`);

  const collections = await localDb.listCollections().toArray();

  for (const { name } of collections) {
    const docs = await localDb.collection(name).find({}).toArray();
    if (docs.length === 0) {
      console.log(`  ${name}: 0 documents, skipped`);
      continue;
    }
    await atlasDb.collection(name).deleteMany({});
    await atlasDb.collection(name).insertMany(docs, { ordered: false });
    console.log(`  ${name}: ${docs.length} documents copied`);
  }

  await localClient.close();
  await atlasClient.close();
  console.log('\nMigration complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
