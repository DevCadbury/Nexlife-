import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'nexlife.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexlife';

async function clearTestData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('nexlife');
    const result = await db.collection('visitors').deleteMany({
      country: { $regex: /^Test/ }
    });
    console.log('Deleted', result.deletedCount, 'test records');

    // Show remaining data
    const remaining = await db.collection('visitors').find({}).toArray();
    console.log('Remaining visitors:', remaining.length);
  } finally {
    await client.close();
  }
}

clearTestData().catch(console.error);