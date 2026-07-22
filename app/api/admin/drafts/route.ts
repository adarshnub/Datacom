import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "../../../lib/admin-auth";
import { discardDrafts, getDrafts } from "../../../lib/admin-drafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: null }, { status: 401 });
  }
  const drafts = await getDrafts();
  return NextResponse.json({ data: { drafts, totalDraftCount: drafts.length }, error: null, meta: null });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: null }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({})) as { ids?: unknown };
  if (payload.ids !== undefined && (!Array.isArray(payload.ids) || payload.ids.some((id) => typeof id !== "string"))) {
    return NextResponse.json({ data: null, error: "ids must be an array of draft IDs.", meta: null }, { status: 400 });
  }
  const ids = Array.isArray(payload.ids) ? payload.ids as string[] : undefined;
  const result = await discardDrafts(ids);
  return NextResponse.json({ data: result, error: null, meta: null });
}
