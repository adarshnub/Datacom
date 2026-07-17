import path from "node:path";
import { assets } from "./assets.mjs";
import { download, manifestPath, meshyFetch, modelRoot, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
let pending = 0;

for (const asset of assets) {
  const entry = manifest.assets[asset.slug];
  if (!entry?.previewTaskId) {
    console.log(`${asset.slug}: NOT_SUBMITTED`);
    continue;
  }

  const task = await meshyFetch(`/openapi/v2/text-to-3d/${entry.previewTaskId}`, { method: "GET" });
  entry.previewStatus = task.status;
  entry.previewProgress = task.progress;
  entry.consumedCredits = task.consumed_credits;
  entry.lastCheckedAt = new Date().toISOString();

  if (task.status === "SUCCEEDED") {
    const rawDir = path.join(modelRoot, "raw", asset.slug);
    if (task.thumbnail_url && !entry.thumbnailPath) {
      const destination = path.join(rawDir, "preview.png");
      await download(task.thumbnail_url, destination);
      entry.thumbnailPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
    if (task.alpha_thumbnail_url && !entry.alphaThumbnailPath) {
      const destination = path.join(rawDir, "preview-alpha.png");
      await download(task.alpha_thumbnail_url, destination);
      entry.alphaThumbnailPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
    if (task.model_urls?.glb && !entry.previewModelPath) {
      const destination = path.join(rawDir, "preview.glb");
      await download(task.model_urls.glb, destination);
      entry.previewModelPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
  } else if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
    pending += 1;
  } else if (task.status === "FAILED") {
    entry.error = task.task_error?.message ?? "Unknown Meshy failure";
  }

  console.log(`${asset.slug}: ${task.status} ${task.progress ?? 0}%`);
}

manifest.lastCheckedAt = new Date().toISOString();
await writeManifest(manifest);
console.log(`manifest: ${path.relative(process.cwd(), manifestPath)}`);
if (pending > 0) process.exitCode = 2;
