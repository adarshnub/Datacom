import fs from "node:fs/promises";
import path from "node:path";

export const projectRoot = process.cwd();
export const meshyDir = path.join(projectRoot, ".meshy");
export const manifestPath = path.join(meshyDir, "tasks.json");
export const modelRoot = path.join(projectRoot, "public", "models", "datacom");

export async function getApiKey() {
  const existing = process.env.MESHY_API_KEY?.trim();
  if (existing) return existing;
  const envPath = path.join(projectRoot, ".env.local");
  const env = await fs.readFile(envPath, "utf8");
  const line = env.split(/\r?\n/).find((entry) => entry.startsWith("MESHY_API_KEY="));
  if (!line) throw new Error("MESHY_API_KEY is missing from .env.local");
  const key = line.slice("MESHY_API_KEY=".length).trim().replace(/^['\"]|['\"]$/g, "");
  if (!key.startsWith("msy_")) throw new Error("MESHY_API_KEY does not have the expected prefix");
  return key;
}

export async function meshyFetch(endpoint, options = {}) {
  const apiKey = await getApiKey();
  const response = await fetch(`https://api.meshy.ai${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.message || body?.detail || JSON.stringify(body);
    throw new Error(`Meshy ${response.status}: ${message}`);
  }
  return body;
}

export async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return { createdAt: new Date().toISOString(), assets: {} };
    throw error;
  }
}

export async function writeManifest(manifest) {
  await fs.mkdir(meshyDir, { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

export async function fileToDataUri(filePath) {
  const bytes = await fs.readFile(path.resolve(projectRoot, filePath));
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
