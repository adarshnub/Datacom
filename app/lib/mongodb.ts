import { Db, MongoClient, ServerApiVersion } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  datacomMongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured. Add it to .env.local before starting the app.");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client.connect();
}

export function getMongoClient() {
  if (!globalForMongo.datacomMongoClientPromise) {
    globalForMongo.datacomMongoClientPromise = createClientPromise().catch((error) => {
      globalForMongo.datacomMongoClientPromise = undefined;
      throw error;
    });
  }

  return globalForMongo.datacomMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || "datacom");
}
