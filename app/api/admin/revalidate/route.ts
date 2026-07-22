import { NextResponse } from "next/server";
import { getAdminSession } from "../../../lib/admin-auth";
import { revalidateContentCache } from "../../../lib/content-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: null }, { status: 401 });
  }
  const result = revalidateContentCache();
  return NextResponse.json({ data: { revalidated: true, ...result }, error: null, meta: null });
}
