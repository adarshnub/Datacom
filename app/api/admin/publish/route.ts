import { NextResponse } from "next/server";
import { getAdminSession } from "../../../lib/admin-auth";
import { publishDrafts } from "../../../lib/admin-drafts";
import { revalidateContentCache } from "../../../lib/content-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: null }, { status: 401 });
  }

  const result = await publishDrafts(session.email);
  const revalidation = result.affectedCollections.map((collection) => ({
    collection,
    ...revalidateContentCache(collection),
  }));

  return NextResponse.json({ data: { ...result, revalidation }, error: null, meta: null });
}
