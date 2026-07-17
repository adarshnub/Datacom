import path from "node:path";
import { assets } from "./assets.mjs";
import { download, meshyFetch, modelRoot, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
let pending = 0;

for (const asset of assets.filter((item) => item.referencePrompt)) {
  const entry = manifest.assets[asset.slug];
  if (!entry?.referenceTaskId) continue;
  const task = await meshyFetch(`/openapi/v1/text-to-image/${entry.referenceTaskId}`, { method: "GET" });
  entry.referenceStatus = task.status;
  entry.referenceProgress = task.progress;
  entry.referenceCredits = task.consumed_credits;
  if (task.status === "SUCCEEDED") {
    entry.referenceImagePaths ??= [];
    for (const [index, url] of (task.image_urls ?? []).entries()) {
      if (entry.referenceImagePaths[index]) continue;
      const destination = path.join(modelRoot, "raw", asset.slug, "references", `view-${index + 1}.png`);
      await download(url, destination);
      entry.referenceImagePaths[index] = path.relative(process.cwd(), destination).replaceAll("\\", "/");
    }
  } else if (task.status === "PENDING" || task.status === "IN_PROGRESS") {
    pending += 1;
  } else if (task.status === "FAILED") {
    entry.referenceError = task.task_error?.message ?? "Unknown Meshy image-generation failure";
  }
  console.log(`${asset.slug}: ${task.status} ${task.progress ?? 0}%`);
}

await writeManifest(manifest);
if (pending > 0) process.exitCode = 2;
