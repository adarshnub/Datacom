import { assets } from "./assets.mjs";
import { meshyFetch, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
const approved = new Set(process.argv.slice(2));

if (approved.size === 0) {
  throw new Error("Pass one or more approved asset slugs, e.g. npm run meshy:refine -- datacom-rack-d07");
}

for (const asset of assets.filter((item) => approved.has(item.slug))) {
  const entry = manifest.assets[asset.slug];
  if (!entry || entry.previewStatus !== "SUCCEEDED") {
    throw new Error(`${asset.slug} does not have a successful preview`);
  }
  if (entry.refineTaskId) {
    console.log(`${asset.slug}: refine already submitted (${entry.refineTaskId})`);
    continue;
  }

  const result = await meshyFetch("/openapi/v2/text-to-3d", {
    method: "POST",
    body: JSON.stringify({
      mode: "refine",
      preview_task_id: entry.previewTaskId,
      ai_model: "latest",
      texture_prompt: asset.texturePrompt,
      enable_pbr: true,
      hd_texture: false,
      remove_lighting: true,
      target_formats: ["glb"],
      alpha_thumbnail: true,
      moderation: true,
    }),
  });

  entry.refineTaskId = result.result;
  entry.refineStatus = "PENDING";
  entry.refineSubmittedAt = new Date().toISOString();
  await writeManifest(manifest);
  console.log(`${asset.slug}: refine submitted ${result.result}`);
}
