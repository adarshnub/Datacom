import { assets } from "./assets.mjs";
import { meshyFetch, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();

for (const asset of assets) {
  const existing = manifest.assets[asset.slug];
  if (existing?.previewTaskId) {
    console.log(`${asset.slug}: preview already submitted (${existing.previewTaskId})`);
    continue;
  }

  const result = await meshyFetch("/openapi/v2/text-to-3d", {
    method: "POST",
    body: JSON.stringify({
      mode: "preview",
      prompt: asset.prompt,
      model_type: "standard",
      ai_model: "latest",
      should_remesh: true,
      topology: "triangle",
      target_polycount: asset.polycount,
      target_formats: ["glb"],
      alpha_thumbnail: true,
      moderation: true,
    }),
  });

  manifest.assets[asset.slug] = {
    previewTaskId: result.result,
    previewStatus: "PENDING",
    targetPolycount: asset.polycount,
    targetSizeMetres: asset.size,
    submittedAt: new Date().toISOString(),
  };
  await writeManifest(manifest);
  console.log(`${asset.slug}: submitted ${result.result}`);
}
