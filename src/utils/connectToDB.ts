import mongoose from 'mongoose'

let cachedDbConnection: typeof mongoose | null = null

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cachedDbConnection) {
    return cachedDbConnection
  }

  const dbUri = process.env.MONGODB_URI
  if (!dbUri) {
    throw new Error('MONGODB_URI environment variable not available')
  }

  try {
    cachedDbConnection = await mongoose.connect(dbUri)
    return cachedDbConnection
  } catch (error: any) {
    cachedDbConnection = null
    throw new Error(`Failed to connect to MongoDB: ${error.message}`)
  }
}
