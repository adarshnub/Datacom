import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminCollection } from "../../lib/admin-config";
import { revalidateContentCache } from "../../lib/content-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RevalidationPayload = {
  collection?: unknown;
  scope?: unknown;
};

function secureEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

function suppliedSecret(request: NextRequest) {
  const headerSecret = request.headers.get("x-revalidate-secret");
  if (headerSecret) return headerSecret;
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATION_SECRET;
  if (!expectedSecret || expectedSecret.length < 32 || !secureEqual(suppliedSecret(request), expectedSecret)) {
    return NextResponse.json(
      { data: null, error: "Invalid revalidation secret.", meta: null },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => ({})) as RevalidationPayload;
  const collection = typeof payload.collection === "string" ? payload.collection : undefined;
  const revalidateAll = payload.scope === "all" || (!collection && payload.scope === undefined);
  const targetCollection = !revalidateAll && collection && isAdminCollection(collection) ? collection : undefined;

  if (!revalidateAll && !targetCollection) {
    return NextResponse.json(
      { data: null, error: "Provide scope \"all\" or a valid collection name.", meta: null },
      { status: 400 },
    );
  }

  const result = revalidateContentCache(targetCollection);
  return NextResponse.json({ data: { revalidated: true, ...result }, error: null, meta: null });
}
