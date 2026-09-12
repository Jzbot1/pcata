
const mongoose = require('mongoose');

const OLD_URI = process.env.OLD_MONGO_URI || 'mongodb+srv://mszapachuau:MmSbewafAcfkMmUi@cluster0.j2pdd.mongodb.net/mlbb';
const NEW_URI = process.env.NEW_MONGO_URI || process.argv[2];

if (!NEW_URI) {
  console.error('Please provide the NEW_MONGO_URI as an argument or environment variable.');
  process.exit(1);
}

async function migrate() {
  console.log('--- STARTING MONGODB MIGRATION ---');
  console.log('Connecting to Old DB...');
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('Connected to Old DB.');

  console.log('Connecting to New DB...');
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('Connected to New DB.');

  const oldDb = oldConn.db;
  const newDb = newConn.db;

  const collections = await oldDb.listCollections().toArray();
  console.log('Found ' + collections.length + ' collections to migrate.');

  for (const col of collections) {
    const name = col.name;
    if (name.startsWith('system.')) continue;

    console.log('\n--- Migrating collection: ' + name + ' ---');
    const oldCollection = oldDb.collection(name);
    const newCollection = newDb.collection(name);

    const count = await oldCollection.countDocuments();
    console.log('Total documents in ' + name + ': ' + count);

    if (count === 0) {
      console.log('Skipping empty collection: ' + name);
      continue;
    }

    const docs = await oldCollection.find({}).toArray();

    // Clear existing docs in destination to avoid duplicates on re-run
    await newCollection.deleteMany({});
    
    // Insert all documents
    const result = await newCollection.insertMany(docs);
    console.log('Successfully inserted ' + result.insertedCount + ' documents into ' + name);

    // Copy indexes (except default _id)
    try {
      const indexes = await oldCollection.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        await newCollection.createIndex(keys, options);
      }
      console.log('Indexes copied for ' + name);
    } catch (idxErr) {
      console.log('Note on indexes for ' + name + ':', idxErr.message);
    }
  }

  console.log('\n========================================');
  console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('========================================');

  await oldConn.close();
  await newConn.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

