import { getCollections } from './db.js';

async function cleanup() {
  try {
    const { visitors } = await getCollections();
    const result = await visitors.deleteMany({
      country: { $regex: '^Test' }
    });
    console.log('Deleted', result.deletedCount, 'test records');

    const remaining = await visitors.countDocuments();
    console.log('Remaining visitors:', remaining);
  } catch (err) {
    console.error('Error:', err);
  }
}

cleanup();