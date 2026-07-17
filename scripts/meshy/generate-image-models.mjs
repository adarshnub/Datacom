import { assets } from "./assets.mjs";
import { fileToDataUri, meshyFetch, readManifest, writeManifest } from "./lib.mjs";

const manifest = await readManifest();
const generationPlan = {
  "datacom-hospital-shell": { viewIndex: 0, modelType: "standard", aiModel: "latest" },
  "datacom-rack-d07": { viewIndex: 0, modelType: "smart-topology", aiModel: "meshy-t2" },
  "datacom-mpo-panel-1u": { viewIndex: 2, modelType: "smart-topology", aiModel: "meshy-t2" },
  "datacom-fibre-port-24": { viewIndex: 1, modelType: "smart-topology", aiModel: "meshy-t2" },
};

for (const asset of assets.filter((item) => item.referencePrompt)) {
  const entry = manifest.assets[asset.slug];
  if (!entry || entry.referenceStatus !== "SUCCEEDED") {
    console.log(`${asset.slug}: reference not ready`);
    continue;
  }
  if (entry.imageModelTaskId) {
    console.log(`${asset.slug}: image model already submitted (${entry.imageModelTaskId})`);
    continue;
  }
  const plan = generationPlan[asset.slug];
  const imagePath = entry.referenceImagePaths?.[plan.viewIndex];
  if (!imagePath) throw new Error(`${asset.slug}: selected reference image is missing`);
  const imageUrl = await fileToDataUri(imagePath);
  const generationOptions = plan.modelType === "standard"
    ? { should_remesh: true, topology: "triangle", image_enhancement: false }
    : {};
  const result = await meshyFetch("/openapi/v1/image-to-3d", {
    method: "POST",
    body: JSON.stringify({
      image_url: imageUrl,
      model_type: plan.modelType,
      ai_model: plan.aiModel,
      should_texture: false,
      target_polycount: asset.polycount,
      target_formats: ["glb"],
      alpha_thumbnail: true,
      moderation: true,
      ...generationOptions,
    }),
  });
  entry.imageModelTaskId = result.result;
  entry.imageModelStatus = "PENDING";
  entry.imageModelEndpoint = "image-to-3d";
  entry.selectedReferenceView = plan.viewIndex + 1;
  entry.imageModelType = plan.modelType;
  entry.imageAiModel = plan.aiModel;
  entry.imageModelSubmittedAt = new Date().toISOString();
  await writeManifest(manifest);
  console.log(`${asset.slug}: image model submitted ${result.result}`);
}
