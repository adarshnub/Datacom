import { assets } from "./assets.mjs";
import { meshyFetch, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
const referenceAssets = assets.filter((asset) => asset.referencePrompt);

for (const asset of referenceAssets) {
  const entry = manifest.assets[asset.slug] ??= {};
  if (entry.referenceTaskId) {
    console.log(`${asset.slug}: reference already submitted (${entry.referenceTaskId})`);
    continue;
  }
  const result = await meshyFetch("/openapi/v1/text-to-image", {
    method: "POST",
    body: JSON.stringify({
      ai_model: "nano-banana-pro",
      prompt: asset.referencePrompt,
      generate_multi_view: true,
    }),
  });
  entry.referenceTaskId = result.result;
  entry.referenceStatus = "PENDING";
  entry.referenceSubmittedAt = new Date().toISOString();
  await writeManifest(manifest);
  console.log(`${asset.slug}: reference submitted ${result.result}`);
}
