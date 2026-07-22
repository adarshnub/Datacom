import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { isAdminCollection } from "../../../../../lib/admin-config";
import { stageDeleteDraft, stageUpsertDraft } from "../../../../../lib/admin-drafts";

type RouteContext = {
  params: Promise<{ collection: string; id: string }>;
};

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection, id } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || Array.isArray(body)) {
    return NextResponse.json({ error: "A valid JSON object is required." }, { status: 400 });
  }

  const { _id, _position, _sourceFile, ...content } = body;
  void _id;
  void _position;
  void _sourceFile;
  const result = await stageUpsertDraft(collection, id, content, session.email);
  if (!result.found) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }
  return NextResponse.json({ document: { ...content, id }, draft: result.draft, totalDraftCount: result.totalDraftCount });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection, id } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const result = await stageDeleteDraft(collection, id, session.email);
  if (!result.found) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
