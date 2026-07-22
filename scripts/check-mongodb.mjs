import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "datacom";
const dataRoot = path.join(process.cwd(), "app", "data");

if (!uri) {
  throw new Error("MONGODB_URI is missing. Add it to .env.local first.");
}

function collectionNameFor(filename) {
  return path
    .basename(filename, ".json")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

const filenames = (await readdir(dataRoot)).filter((filename) => filename.endsWith(".json")).sort();
const expected = await Promise.all(
  filenames.map(async (filename) => {
    const json = JSON.parse(await readFile(path.join(dataRoot, filename), "utf8"));
    return {
      filename,
      collectionName: collectionNameFor(filename),
      count: Array.isArray(json) ? json.length : Object.keys(json).length,
      json,
    };
  }),
);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  await client.connect();
  const database = client.db(databaseName);
  await database.command({ ping: 1 });

  let total = 0;
  let valid = true;
  for (const item of expected) {
    const documents = await database.collection(item.collectionName).find({}).sort({ _position: 1 }).toArray();
    const storedRecords = documents.map(({ _id, _position, _sourceFile, ...record }) => {
      void _id;
      void _position;
      void _sourceFile;
      return record;
    });
    const storedJson = Array.isArray(item.json)
      ? storedRecords
      : item.filename === "product-verifications.json"
        ? Object.fromEntries(storedRecords.map((record) => [record.code, record.certificateIds]))
        : storedRecords[0]?.data;
    const matches = documents.length === item.count && isDeepStrictEqual(storedJson, item.json);
    total += documents.length;
    valid &&= matches;
    console.log(`${item.collectionName}: ${documents.length}/${item.count} ${matches ? "EXACT" : "MISMATCH"}`);
  }

  if (!valid) {
    throw new Error("MongoDB documents do not exactly match the JSON source files.");
  }
  console.log(`MongoDB verified: ${total} records across ${expected.length} JSON collections in "${databaseName}".`);
} finally {
  await client.close();
}
