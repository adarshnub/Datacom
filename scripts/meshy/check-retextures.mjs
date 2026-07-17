import path from "node:path";
import { assets } from "./assets.mjs";
import { download, meshyFetch, modelRoot, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
let pending = 0;

for (const asset of assets) {
  const entry = manifest.assets[asset.slug];
  if (!entry?.retextureTaskId) continue;
  const task = await meshyFetch(`/openapi/v1/retexture/${entry.retextureTaskId}`, { method: "GET" });
  entry.retextureStatus = task.status;
  entry.retextureProgress = task.progress;
  entry.retextureCredits = task.consumed_credits;
  if (task.status === "SUCCEEDED") {
    const reviewDir = path.join(modelRoot, "raw", asset.slug, "textured");
    if (task.thumbnail_url && !entry.retextureThumbnailPath) {
      const destination = path.join(reviewDir, "preview.png");
      await download(task.thumbnail_url, destination);
      entry.retextureThumbnailPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
    if (task.model_urls?.glb && !entry.finalModelPath) {
      const destination = path.join(modelRoot, `${asset.slug}.glb`);
      await download(task.model_urls.glb, destination);
      entry.finalModelPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
  } else if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
    pending += 1;
  } else if (task.status === "FAILED") {
    entry.retextureError = task.task_error?.message ?? "Unknown retexture failure";
  }
  console.log(`${asset.slug}: ${task.status} ${task.progress ?? 0}%`);
}

await writeManifest(manifest);
if (pending > 0) process.exitCode = 2;
