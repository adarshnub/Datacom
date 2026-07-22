import type { ClientSession } from "mongodb";
import type { AdminCollectionName } from "./admin-config";
import { getDatabase, getMongoClient } from "./mongodb";

const DRAFT_COLLECTION = "cmsDrafts";

type AdminStoredDocument = Record<string, unknown> & {
  _id: string;
  _position: number;
  _sourceFile: string;
  id: string;
};

export type CmsDraft = {
  _id: string;
  collection: AdminCollectionName;
  documentId: string;
  operation: "upsert" | "delete";
  document?: Record<string, unknown>;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type CollectionWorkspace = {
  documents: Record<string, unknown>[];
  draftIds: string[];
  pendingDeleteIds: string[];
  collectionDraftCount: number;
  totalDraftCount: number;
};

let indexPromise: Promise<string> | undefined;

function draftId(collection: AdminCollectionName, documentId: string) {
  return `${collection}::${documentId}`;
}

async function draftsCollection() {
  const database = await getDatabase();
  const collection = database.collection<CmsDraft>(DRAFT_COLLECTION);
  indexPromise ||= collection.createIndex({ collection: 1, updatedAt: -1 }, { name: "cms_drafts_collection_updated" });
  await indexPromise;
  return collection;
}

function publicDocument(document: Record<string, unknown>) {
  const { _id, _position, _sourceFile, ...content } = document;
  void _id;
  void _position;
  void _sourceFile;
  return content;
}

export async function getDraftCount() {
  return (await draftsCollection()).countDocuments();
}

export async function getDrafts() {
  return (await draftsCollection()).find({}).sort({ updatedAt: -1 }).toArray();
}

export async function stageCreateDraft(
  collectionName: AdminCollectionName,
  documentId: string,
  document: Record<string, unknown>,
  updatedBy: string,
) {
  const database = await getDatabase();
  const collection = await draftsCollection();
  const [liveDocument, existingDraft] = await Promise.all([
    database.collection<AdminStoredDocument>(collectionName).findOne({ _id: documentId }),
    collection.findOne({ _id: draftId(collectionName, documentId) }),
  ]);
  if (liveDocument || existingDraft) {
    return { created: false as const, totalDraftCount: await collection.countDocuments() };
  }

  const now = new Date().toISOString();
  const draft: CmsDraft = {
    _id: draftId(collectionName, documentId),
    collection: collectionName,
    documentId,
    operation: "upsert",
    document: { ...document, id: documentId },
    isNew: true,
    createdAt: now,
    updatedAt: now,
    updatedBy,
  };

  try {
    await collection.insertOne(draft);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return { created: false as const, totalDraftCount: await collection.countDocuments() };
    }
    throw error;
  }
  return { created: true as const, draft, totalDraftCount: await collection.countDocuments() };
}

export async function getCollectionWorkspace(collectionName: AdminCollectionName): Promise<CollectionWorkspace> {
  const database = await getDatabase();
  const [records, collectionDrafts, totalDraftCount] = await Promise.all([
    database.collection<AdminStoredDocument>(collectionName).find({}).sort({ _position: 1 }).limit(1000).toArray(),
    (await draftsCollection()).find({ collection: collectionName }).sort({ updatedAt: 1 }).toArray(),
    getDraftCount(),
  ]);

  const order = records.map((record) => record.id);
  const documentIndex = new Map(records.map((record) => [record.id, publicDocument(record)]));
  const draftIds: string[] = [];
  const pendingDeleteIds: string[] = [];

  for (const draft of collectionDrafts) {
    if (draft.operation === "delete") {
      documentIndex.delete(draft.documentId);
      pendingDeleteIds.push(draft.documentId);
      continue;
    }
    if (!documentIndex.has(draft.documentId)) order.push(draft.documentId);
    documentIndex.set(draft.documentId, draft.document || { id: draft.documentId });
    draftIds.push(draft.documentId);
  }

  return {
    documents: order.flatMap((id) => {
      const document = documentIndex.get(id);
      return document ? [document] : [];
    }),
    draftIds,
    pendingDeleteIds,
    collectionDraftCount: collectionDrafts.length,
    totalDraftCount,
  };
}

export async function stageUpsertDraft(
  collectionName: AdminCollectionName,
  documentId: string,
  document: Record<string, unknown>,
  updatedBy: string,
) {
  const database = await getDatabase();
  const collection = await draftsCollection();
  const [liveDocument, existingDraft] = await Promise.all([
    database.collection<AdminStoredDocument>(collectionName).findOne({ _id: documentId }),
    collection.findOne({ _id: draftId(collectionName, documentId) }),
  ]);
  if (!liveDocument && existingDraft?.operation !== "upsert") {
    return { found: false as const, totalDraftCount: await collection.countDocuments() };
  }
  const now = new Date().toISOString();
  const draft: CmsDraft = {
    _id: draftId(collectionName, documentId),
    collection: collectionName,
    documentId,
    operation: "upsert",
    document: { ...document, id: documentId },
    isNew: !liveDocument,
    createdAt: existingDraft?.createdAt || now,
    updatedAt: now,
    updatedBy,
  };

  await collection.replaceOne({ _id: draft._id }, draft, { upsert: true });
  return { found: true as const, draft, totalDraftCount: await collection.countDocuments() };
}

export async function stageDeleteDraft(
  collectionName: AdminCollectionName,
  documentId: string,
  updatedBy: string,
) {
  const database = await getDatabase();
  const collection = await draftsCollection();
  const [liveDocument, existingDraft] = await Promise.all([
    database.collection<AdminStoredDocument>(collectionName).findOne({ _id: documentId }),
    collection.findOne({ _id: draftId(collectionName, documentId) }),
  ]);

  if (!liveDocument && existingDraft?.operation === "upsert") {
    await collection.deleteOne({ _id: existingDraft._id });
    return { found: true, cancelledNewDraft: true, totalDraftCount: await collection.countDocuments() };
  }
  if (!liveDocument) return { found: false, cancelledNewDraft: false, totalDraftCount: await collection.countDocuments() };

  const now = new Date().toISOString();
  const draft: CmsDraft = {
    _id: draftId(collectionName, documentId),
    collection: collectionName,
    documentId,
    operation: "delete",
    isNew: false,
    createdAt: existingDraft?.createdAt || now,
    updatedAt: now,
    updatedBy,
  };
  await collection.replaceOne({ _id: draft._id }, draft, { upsert: true });
  return { found: true, cancelledNewDraft: false, totalDraftCount: await collection.countDocuments() };
}

export async function discardDrafts(ids?: string[]) {
  const collection = await draftsCollection();
  const result = ids?.length
    ? await collection.deleteMany({ _id: { $in: ids } })
    : await collection.deleteMany({});
  return { discardedCount: result.deletedCount, totalDraftCount: await collection.countDocuments() };
}

async function nextPosition(
  database: Awaited<ReturnType<typeof getDatabase>>,
  collectionName: AdminCollectionName,
  session: ClientSession,
) {
  const last = await database
    .collection<AdminStoredDocument>(collectionName)
    .find({}, { session })
    .sort({ _position: -1 })
    .limit(1)
    .next();
  return typeof last?._position === "number" ? last._position + 1 : 0;
}

export async function publishDrafts(publishedBy: string) {
  const client = await getMongoClient();
  const database = client.db(process.env.MONGODB_DB || "datacom");
  const session = client.startSession();
  let publishedCount = 0;
  let affectedCollections: AdminCollectionName[] = [];

  try {
    const result = await session.withTransaction(async () => {
      const drafts = await database.collection<CmsDraft>(DRAFT_COLLECTION).find({}, { session }).sort({ updatedAt: 1 }).toArray();
      const collections = new Set<AdminCollectionName>();
      for (const draft of drafts) {
        const target = database.collection<AdminStoredDocument>(draft.collection);
        collections.add(draft.collection);

        if (draft.operation === "delete") {
          await target.deleteOne({ _id: draft.documentId }, { session });
        } else {
          const current = await target.findOne({ _id: draft.documentId }, { session });
          const position = current?._position ?? await nextPosition(database, draft.collection, session);
          await target.replaceOne(
            { _id: draft.documentId },
            {
              _id: draft.documentId,
              _position: position,
              _sourceFile: current?._sourceFile || "admin",
              ...(draft.document || {}),
              id: draft.documentId,
            },
            { upsert: true, session },
          );
        }
      }

      if (drafts.length) {
        await database.collection<CmsDraft>(DRAFT_COLLECTION).deleteMany(
          { _id: { $in: drafts.map((draft) => draft._id) } },
          { session },
        );
      }
      return { publishedCount: drafts.length, affectedCollections: [...collections] };
    });
    publishedCount = result?.publishedCount || 0;
    affectedCollections = result?.affectedCollections || [];
  } finally {
    await session.endSession();
  }

  const totalDraftCount = await database.collection<CmsDraft>(DRAFT_COLLECTION).countDocuments();
  return { publishedCount, affectedCollections, totalDraftCount, publishedBy };
}
