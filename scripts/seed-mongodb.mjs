import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { MongoClient } from "mongodb";

const dataRoot = path.join(process.cwd(), "app", "data");
const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "datacom";

if (!uri) {
  throw new Error("MONGODB_URI is missing. Add it to .env.local and run npm run db:seed again.");
}

function collectionNameFor(filename) {
  return path
    .basename(filename, ".json")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function recordsFor(filename, json) {
  if (Array.isArray(json)) return json;

  if (filename === "product-verifications.json") {
    return Object.entries(json).map(([code, certificateIds]) => ({
      id: code,
      code,
      certificateIds,
    }));
  }

  return [{ id: "root", data: json }];
}

function assertUnique(records, field, collectionName) {
  const seen = new Set();
  for (const record of records) {
    const value = record[field];
    if (typeof value !== "string" || !value) {
      throw new Error(`${collectionName} contains a record without a valid ${field}`);
    }
    if (seen.has(value)) {
      throw new Error(`${collectionName} contains duplicate ${field}: ${value}`);
    }
    seen.add(value);
  }
}

const indexDefinitions = {
  productCatalog: [
    { key: { family: 1 }, options: { name: "product_catalog_family" } },
    { key: { featured: 1, _position: 1 }, options: { name: "product_catalog_featured" } },
    { key: { partNumbers: 1 }, options: { name: "product_catalog_part_numbers" } },
    {
      key: { name: "text", code: "text", spec: "text", searchText: "text", partNumbers: "text" },
      options: { name: "product_catalog_search" },
    },
  ],
  productCatalogPublic: [
    { key: { family: 1 }, options: { name: "product_catalog_public_family" } },
    { key: { featured: 1 }, options: { name: "product_catalog_public_featured" } },
  ],
  featuredProducts: [{ key: { family: 1 }, options: { name: "featured_products_family" } }],
  skuCatalogPublic: [
    { key: { code: 1 }, options: { name: "sku_catalog_code", unique: true } },
    { key: { family: 1 }, options: { name: "sku_catalog_family" } },
    { key: { groupId: 1 }, options: { name: "sku_catalog_group" } },
    {
      key: { name: "text", code: "text", spec: "text", searchText: "text" },
      options: { name: "sku_catalog_search" },
    },
  ],
  productHierarchy: [
    { key: { path: 1 }, options: { name: "hierarchy_path", unique: true } },
    { key: { parentId: 1 }, options: { name: "hierarchy_parent" } },
  ],
  nestedProductsPublic: [
    { key: { path: 1 }, options: { name: "nested_products_path", unique: true } },
    { key: { topLevel: 1 }, options: { name: "nested_products_top_level" } },
  ],
  certificates: [
    { key: { issuer: 1, status: 1 }, options: { name: "certificates_issuer_status" } },
    { key: { partNumbers: 1 }, options: { name: "certificates_part_numbers" } },
    {
      key: { title: "text", certificateNo: "text", scope: "text", standards: "text", partNumbers: "text" },
      options: { name: "certificates_search" },
    },
  ],
  certificatesPublic: [
    { key: { issuer: 1, status: 1 }, options: { name: "certificates_public_issuer_status" } },
  ],
  productVerifications: [
    { key: { code: 1 }, options: { name: "verifications_code", unique: true } },
    { key: { certificateIds: 1 }, options: { name: "verifications_certificates" } },
  ],
};

async function loadDatasets() {
  const filenames = (await readdir(dataRoot)).filter((filename) => filename.endsWith(".json")).sort();
  return Promise.all(
    filenames.map(async (filename) => {
      const json = JSON.parse(await readFile(path.join(dataRoot, filename), "utf8"));
      return {
        filename,
        collectionName: collectionNameFor(filename),
        records: recordsFor(filename, json),
      };
    }),
  );
}

async function syncCollection(database, dataset) {
  const { collectionName, filename, records } = dataset;
  assertUnique(records, "id", collectionName);
  const collection = database.collection(collectionName);
  const documents = records.map((record, position) => ({
    _id: record.id,
    _position: position,
    _sourceFile: filename,
    ...record,
  }));

  await collection.bulkWrite(
    documents.map((document) => ({
      replaceOne: {
        filter: { _id: document._id },
        replacement: document,
        upsert: true,
      },
    })),
    { ordered: false },
  );
  await collection.deleteMany({ _id: { $nin: documents.map((document) => document._id) } });

  for (const index of indexDefinitions[collectionName] || []) {
    await collection.createIndex(index.key, index.options);
  }

  return documents.length;
}

const datasets = await loadDatasets();
// Index administration includes text indexes, which are intentionally outside
// MongoDB Stable API strict mode. Runtime application connections remain strict.
const client = new MongoClient(uri);

try {
  await client.connect();
  const database = client.db(databaseName);
  await database.command({ ping: 1 });

  const counts = {};
  for (const dataset of datasets) {
    counts[dataset.collectionName] = await syncCollection(database, dataset);
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  console.log(`Seeded every JSON dataset: ${total} records across ${datasets.length} collections in "${databaseName}".`);
  for (const [name, count] of Object.entries(counts)) {
    console.log(`  ${name}: ${count}`);
  }
} finally {
  await client.close();
}
