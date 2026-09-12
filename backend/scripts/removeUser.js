const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const usersCollection = mongoose.connection.db.collection('users');

  const result = await usersCollection.deleteOne({ email: 'zomuansangjacob523@gmail.com' });
  console.log('DELETE_RESULT:', JSON.stringify(result));

  const admins = await usersCollection.find({ isAdmin: true }).project({ fname: 1, email: 1, mobile: 1, balance: 1, reseller: 1, created: 1, isAdmin: 1 }).toArray();
  console.log('REMAINING_ADMINS:\n' + JSON.stringify(admins, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
