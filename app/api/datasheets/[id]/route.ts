import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "../../../lib/data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Specification sheet not found" }, { status: 404 });
  }

  const specificationRoot = path.resolve(process.cwd(), "client-docs", "SPECIFICATION SHEETS");
  const sourcePath = path.resolve(specificationRoot, ...product.sourceFile.split("/"));

  if (!sourcePath.startsWith(`${specificationRoot}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid specification path" }, { status: 400 });
  }

  try {
    const file = await readFile(sourcePath);
    const download = request.nextUrl.searchParams.get("download") === "1";
    const safeFilename = `${product.name.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "") || product.id}.pdf`;

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(file.byteLength),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Specification file is unavailable" }, { status: 404 });
  }
}
