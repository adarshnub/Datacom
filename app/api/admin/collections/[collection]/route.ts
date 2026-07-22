import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/admin-auth";
import { isAdminCollection } from "../../../../lib/admin-config";
import { getDatabase } from "../../../../lib/mongodb";

type RouteContext = {
  params: Promise<{ collection: string }>;
};

type AdminStoredDocument = Record<string, unknown> & {
  _id: string;
  _position: number;
  _sourceFile: string;
  id: string;
};

export const runtime = "nodejs";

function publicDocument(document: Record<string, unknown>) {
  const { _id, _position, _sourceFile, ...content } = document;
  void _id;
  void _position;
  void _sourceFile;
  return content;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  const database = await getDatabase();
  const records = await database.collection<AdminStoredDocument>(collection).find({}).sort({ _position: 1 }).limit(1000).toArray();
  const documents = records
    .map((record) => publicDocument(record))
    .filter((record) => !query || JSON.stringify(record).toLowerCase().includes(query));

  return NextResponse.json({ documents, total: documents.length });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!body || Array.isArray(body) || !id) {
    return NextResponse.json({ error: "A JSON object with a non-empty string id is required." }, { status: 400 });
  }

  const { _id, _position, _sourceFile, ...content } = body;
  void _id;
  void _position;
  void _sourceFile;
  const database = await getDatabase();
  const target = database.collection<AdminStoredDocument>(collection);
  const exists = await target.findOne({ _id: id });
  if (exists) {
    return NextResponse.json({ error: `A record with id "${id}" already exists.` }, { status: 409 });
  }

  const last = await target.find({}).sort({ _position: -1 }).limit(1).next();
  const position = typeof last?._position === "number" ? last._position + 1 : 0;
  await target.insertOne({ _id: id, _position: position, _sourceFile: "admin", ...content, id });
  return NextResponse.json({ document: { ...content, id } }, { status: 201 });
}
