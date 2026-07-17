import path from "node:path";
import { assets } from "./assets.mjs";
import { download, meshyFetch, modelRoot, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
let pending = 0;

for (const asset of assets.filter((item) => item.referencePrompt)) {
  const entry = manifest.assets[asset.slug];
  if (!entry?.imageModelTaskId) continue;
  const endpoint = entry.imageModelEndpoint ?? "multi-image-to-3d";
  const task = await meshyFetch(`/openapi/v1/${endpoint}/${entry.imageModelTaskId}`, { method: "GET" });
  entry.imageModelStatus = task.status;
  entry.imageModelProgress = task.progress;
  entry.imageModelCredits = task.consumed_credits;
  if (task.status === "SUCCEEDED") {
    const outputDir = path.join(modelRoot, "raw", asset.slug, "image-v2");
    if (task.thumbnail_url && !entry.imageModelThumbnailPath) {
      const destination = path.join(outputDir, "preview.png");
      await download(task.thumbnail_url, destination);
      entry.imageModelThumbnailPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
    if (task.alpha_thumbnail_url && !entry.imageModelAlphaThumbnailPath) {
      const destination = path.join(outputDir, "preview-alpha.png");
      await download(task.alpha_thumbnail_url, destination);
      entry.imageModelAlphaThumbnailPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
    if (task.model_urls?.glb && !entry.imageModelPath) {
      const destination = path.join(outputDir, "model.glb");
      await download(task.model_urls.glb, destination);
      entry.imageModelPath = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
  } else if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
    pending += 1;
  } else if (task.status === "FAILED") {
    entry.imageModelError = task.task_error?.message ?? "Unknown Meshy multi-image failure";
  }
  console.log(`${asset.slug}: ${task.status} ${task.progress ?? 0}%`);
}

await writeManifest(manifest);
if (pending > 0) process.exitCode = 2;
