import { MongoClient } from 'mongodb';

// Global variables to cache the MongoDB connection
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Connection URI from environment variable
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Export the clientPromise for use in other files
export default clientPromise;

// Helper function to get database connection
export async function getDatabase() {
  const client = await clientPromise;
  return client.db('ibc-terminal');
}