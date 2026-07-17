export const assets = [
  {
    slug: "datacom-hospital-shell",
    polycount: 45000,
    size: [44, 22, 28],
    prompt:
      "Real-time 3D asset of a premium contemporary five-storey GCC hospital, compact rectangular mass with strong horizontal facade bands, modular panels, recessed regular window grid, central double-height glazed entrance, slim canopy, rooftop MEP screen and a simple medical cross as distinct geometry. Clean architectural proportions, realistic wall thickness, all four sides finished, restrained bevels, bottom-centre origin. No site, road, landscape, people, cars, furniture, signage text, logos, interior rooms, ground plane or background. Game-ready hard-surface geometry.",
    texturePrompt:
      "Premium new-build hospital: warm off-white matte aluminium panels, charcoal shadow gaps, cool smoked blue-grey glazing, brushed dark aluminium frames, light grey concrete base, restrained Datacom signal-orange medical cross. Clean physically plausible PBR, subtle panel variation, no baked lighting, shadows, reflections, dirt, weathering, text or logos.",
    referencePrompt:
      "Create three consistent multi-view industrial design reference images of one premium contemporary five-storey GCC hospital. Compact rectangular footprint, strong horizontal facade bands, warm off-white modular aluminium panels, regular blue-grey recessed windows, central double-height glazed entrance with slim canopy, rooftop MEP screen, one simple orange-red medical cross. Clean realistic architecture, all sides finished, no surroundings. Entire building isolated and centred on a seamless neutral light-grey background, flat soft studio lighting, minimal perspective distortion. No site, roads, landscaping, people, cars, furniture, text, logos, watermark, crop, shadow or extra objects.",
  },
  {
    slug: "datacom-network-room-shell",
    polycount: 22000,
    size: [8, 3.4, 6],
    prompt:
      "Modular empty enterprise network equipment room for a hospital, clean three-sided architectural cutaway with the entire front wall removed. Raised access floor with square tile seams, plain technical walls, dark suspended ceiling grid, two straight overhead ladder cable trays, one closed technical door and simple ventilation grilles. Precise construction, bottom-centre origin. Empty room only: no server racks, cables, monitors, desks, people, loose equipment, text, logos, ground plane or background. Optimized real-time hard-surface geometry with separable floor, walls, ceiling and trays.",
    texturePrompt:
      "Clean critical-facility interior: cool light-grey matte walls, graphite raised-floor tiles, dark charcoal ceiling and cable trays, brushed metal hardware and ventilation grilles. New maintained understated industrial PBR materials. No baked light, shadows, dramatic reflections, dirt, labels, text or logos.",
  },
  {
    slug: "datacom-rack-d07",
    polycount: 15000,
    size: [0.8, 2.05, 1.2],
    prompt:
      "Production-ready 42U enterprise data-centre cabinet, 800mm wide, 1200mm deep, 2050mm high. Anthracite steel frame, perforated front and rear doors, removable side panels, rack rails and feet. Front door open 105 degrees. Populate with eight restrained 1U and 2U servers, one fibre patch panel, horizontal cable manager and slim vertical PDU. Accurate rectangular industrial construction, separate logical parts, restrained bevels, bottom-centre origin. No external cables, room, floor, people, labels, text, logos, excessive screws, sci-fi forms or background.",
    texturePrompt:
      "Premium data-centre hardware: fine-texture anthracite powder-coated rack, near-black server faces, brushed aluminium rail edges, dark perforated steel, tiny restrained cyan and green status LEDs with one Datacom orange accent. Clean new PBR hardware with subtle roughness variation. No baked lighting, dirt, damage, fingerprints, text, numbers, barcodes or logos.",
    referencePrompt:
      "Create three consistent multi-view product references of one precise 42U enterprise data-centre rack, 800mm wide, 1200mm deep, 2050mm high. Anthracite powder-coated steel frame, perforated rear door, removable side panels, front door open 105 degrees. Inside: eight orderly 1U and 2U black servers, one high-density fibre patch panel, horizontal cable manager and slim vertical PDU. Premium realistic industrial construction, restrained bevels, clean new equipment. Entire rack visible and isolated on a seamless neutral light-grey background, flat studio lighting, minimal perspective distortion. No room, floor, external cables, people, labels, text, logos, watermark or extra objects.",
  },
  {
    slug: "datacom-mpo-panel-1u",
    polycount: 8000,
    size: [0.483, 0.04445, 0.3],
    prompt:
      "Accurate real-time 1U 19-inch high-density modular fibre patch panel, slim charcoal metal chassis with rack ears, six removable front cassettes, orderly LC duplex adapter openings, horizontal cable-management lip and small release tabs. Port 24 must be a distinct selectable part. Precise manufacturing proportions, clean rectangular topology, restrained edge bevels, centred origin. No rack, cables, loose connectors, labels, printed numbers, text, logos, dust, damage, background or ground plane. Product-visualization quality optimized for WebGL.",
    texturePrompt:
      "Matte charcoal powder-coated metal chassis, satin black cassette faces, cool grey adapter housings, small cyan and green port inserts, one restrained Datacom orange release tab. Clean physically plausible PBR with subtle roughness. No baked shadows, reflections, dirt, labels, numbers, text or logos.",
    referencePrompt:
      "Create three consistent multi-view product references of one accurate 1U 19-inch high-density modular fibre patch panel. Thin 483mm charcoal metal chassis with rack ears, six equal removable front cassettes, orderly LC duplex adapter openings, shallow horizontal cable-management lip and small release tabs. Crisp manufactured proportions, symmetrical and mechanically plausible, one orange release tab only. Entire product isolated and centred on a seamless neutral light-grey background, flat studio lighting, minimal perspective distortion. No rack, cables, loose connectors, labels, printed numbers, text, logos, watermark, crop, floor or extra objects.",
  },
  {
    slug: "datacom-fibre-port-24",
    polycount: 6000,
    size: [0.014, 0.011, 0.055],
    prompt:
      "Macro product asset of a high-density fibre-optic connector partially inserted into a panel adapter. Precise injection-moulded connector body, separate adapter sleeve, push-pull release tab, strain-relief boot and tiny centred ferrule detail. Enterprise hardware with realistic tolerances, crisp controlled bevels, clean watertight hard-surface geometry, geometric-centre origin. Only a short straight boot; no long cable, panel, rack, hands, labels, text, logos, dirt, scratches, glow, ground plane or background.",
    texturePrompt:
      "Premium fibre connector: cool aqua connector body, dark graphite adapter, satin black strain relief, ceramic-white ferrule and restrained Datacom orange push-pull tab. Fine injection-moulded plastic microtexture, plausible roughness and subtle edge response. Clean flat-lit PBR maps with no baked highlights, shadows, fingerprints, labels, text or logos.",
    referencePrompt:
      "Create three consistent multi-view macro product references of one high-density fibre-optic LC-style connector partially inserted into its small panel adapter. Precise cool-aqua injection-moulded connector body, dark graphite adapter sleeve, orange push-pull release tab, satin black short strain-relief boot and centred ceramic-white ferrule. Mechanically believable enterprise component with crisp tolerances and controlled bevels. Entire object isolated and centred on a seamless neutral light-grey background, flat studio lighting, minimal perspective distortion. No long cable, panel, rack, hands, labels, text, logos, watermark, dirt, glow, crop or extra objects.",
  },
];

for (const asset of assets) {
  if (asset.prompt.length > 600) {
    throw new Error(`${asset.slug} prompt is ${asset.prompt.length} characters; Meshy allows 600.`);
  }
}
