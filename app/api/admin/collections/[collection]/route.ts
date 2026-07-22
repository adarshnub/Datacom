import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/admin-auth";
import { isAdminCollection } from "../../../../lib/admin-config";
import { getCollectionWorkspace, stageCreateDraft } from "../../../../lib/admin-drafts";

type RouteContext = {
  params: Promise<{ collection: string }>;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  const workspace = await getCollectionWorkspace(collection);
  const documents = workspace.documents
    .filter((record) => !query || JSON.stringify(record).toLowerCase().includes(query));

  return NextResponse.json({ ...workspace, documents, total: documents.length });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
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
  const result = await stageCreateDraft(collection, id, content, session.email);
  if (!result.created) {
    return NextResponse.json({ error: `A record with id "${id}" already exists.` }, { status: 409 });
  }

  return NextResponse.json(
    { document: { ...content, id }, draft: result.draft, totalDraftCount: result.totalDraftCount },
    { status: 201 },
  );
}
