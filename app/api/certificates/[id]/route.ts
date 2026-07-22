import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getCertificateById } from "../../../lib/data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const certificate = await getCertificateById(id);

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const certificateRoot = path.resolve(process.cwd(), "client-docs", "CERTIFICATES -TEST REPORTS", "CERTIFICATES");
  const sourcePath = path.resolve(certificateRoot, ...certificate.sourceFile.split("/"));

  if (!sourcePath.startsWith(`${certificateRoot}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid certificate path" }, { status: 400 });
  }

  try {
    const file = await readFile(sourcePath);
    const download = request.nextUrl.searchParams.get("download") === "1";
    const safeFilename = `${certificate.issuer}-${certificate.certificateNo}`.replace(/[^a-z0-9-]+/gi, "-");

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(file.byteLength),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFilename}.pdf"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Certificate file is unavailable" }, { status: 404 });
  }
}
