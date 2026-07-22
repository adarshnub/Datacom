import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { isAdminCollection } from "../../../../../lib/admin-config";
import { getDatabase } from "../../../../../lib/mongodb";

type RouteContext = {
  params: Promise<{ collection: string; id: string }>;
};

type AdminStoredDocument = Record<string, unknown> & {
  _id: string;
  _position: number;
  _sourceFile: string;
  id: string;
};

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
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

  const database = await getDatabase();
  const target = database.collection<AdminStoredDocument>(collection);
  const current = await target.findOne({ _id: id });
  if (!current) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  const { _id, _position, _sourceFile, ...content } = body;
  void _id;
  void _position;
  void _sourceFile;
  await target.replaceOne(
    { _id: id },
    {
      _id: id,
      _position: current._position,
      _sourceFile: current._sourceFile || "admin",
      ...content,
      id,
    },
  );

  return NextResponse.json({ document: { ...content, id } });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { collection, id } = await params;
  if (!isAdminCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const database = await getDatabase();
  const result = await database.collection<AdminStoredDocument>(collection).deleteOne({ _id: id });
  if (!result.deletedCount) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
