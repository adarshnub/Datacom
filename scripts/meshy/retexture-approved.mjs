import { assets } from "./assets.mjs";
import { meshyFetch, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
const approved = new Set(process.argv.slice(2));
if (approved.size === 0) throw new Error("Pass at least one approved asset slug");

for (const asset of assets.filter((item) => approved.has(item.slug))) {
  const entry = manifest.assets[asset.slug];
  if (!entry || entry.imageModelStatus !== "SUCCEEDED") {
    throw new Error(`${asset.slug}: image-driven geometry has not succeeded`);
  }
  if (entry.retextureTaskId) {
    console.log(`${asset.slug}: retexture already submitted (${entry.retextureTaskId})`);
    continue;
  }
  const result = await meshyFetch("/openapi/v1/retexture", {
    method: "POST",
    body: JSON.stringify({
      input_task_id: entry.imageModelTaskId,
      text_style_prompt: asset.texturePrompt,
      ai_model: "latest",
      enable_original_uv: true,
      enable_pbr: true,
      hd_texture: false,
      remove_lighting: true,
      target_formats: ["glb"],
      alpha_thumbnail: true,
    }),
  });
  entry.retextureTaskId = result.result;
  entry.retextureStatus = "PENDING";
  entry.retextureSubmittedAt = new Date().toISOString();
  await writeManifest(manifest);
  console.log(`${asset.slug}: retexture submitted ${result.result}`);
}
