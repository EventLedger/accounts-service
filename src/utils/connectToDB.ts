import mongoose from 'mongoose';

let cachedDbConnection: typeof mongoose | null = null;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedDbConnection) {
    return cachedDbConnection;
  }

  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  try {
    cachedDbConnection = await mongoose.connect(dbUri);
    return cachedDbConnection;
  } catch (error) {
    cachedDbConnection = null;
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}
