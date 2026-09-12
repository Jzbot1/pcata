const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const usersCollection = mongoose.connection.db.collection('users');

  const targetEmail = 'zomuansangajacob523@gmail.com';
  const existing = await usersCollection.findOne({ email: targetEmail });

  if (existing) {
    await usersCollection.updateOne(
      { email: targetEmail },
      { $set: { isAdmin: true, reseller: 'yes', emailVerified: true } }
    );
    console.log('Updated existing user to Admin');
  } else {
    await usersCollection.insertOne({
      email: targetEmail,
      fname: 'Jacob',
      isAdmin: true,
      reseller: 'yes',
      balance: 0,
      authProvider: 'google',
      emailVerified: true,
      mobileVerified: true,
      created: new Date(),
    });
    console.log('Created new Admin user successfully');
  }

  const admins = await usersCollection.find({ isAdmin: true }).project({ fname: 1, email: 1, mobile: 1, balance: 1, reseller: 1, created: 1, isAdmin: 1 }).toArray();
  console.log('CURRENT_ADMIN_LIST:\n' + JSON.stringify(admins, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
