# Datacom Hero — Meshy 3D Asset Brief

## Production goal

Create a modular, real-time asset set for the hero journey:

1. Hospital campus
2. X-ray infrastructure reveal
3. Network room
4. Rack D-07
5. Fibre port 24

The experience is not a cinematic render. Every asset must work as a lightweight GLB in React Three Fiber, accept custom lighting, support material fades, and preserve a stable physical scale.

## Non-negotiable delivery rules

- Output: GLB, metallic/roughness PBR workflow.
- Coordinate system: Y-up, forward facing +Z.
- Origin: bottom-centre for architecture and floor-standing equipment; geometric centre for connectors.
- Apply scale and rotation before export. Scale must be `1,1,1`; rotation must be `0,0,0`.
- Use metres. Do not rely on Meshy's estimated size; match the dimensions below during the cleanup pass.
- No baked shadows, reflections, glow, depth of field, environment, ground plane, people, vehicles, loose props, text, or logos.
- No transparent textures for glass. Glass will use a separate material in the website.
- No disconnected floating geometry, inverted normals, internal duplicate faces, non-manifold surfaces, or zero-area triangles.
- Textures must be flat-lit. Lighting belongs to Three.js, not the base-colour map.
- Prefer a small number of clean material slots. Do not give every tiny part a unique material.
- Keep doors, shell/glass, rack frame, server equipment, patch panel, PDU, and connector parts separable when specified.
- Do not generate cables as mesh assets. Fibre and copper paths will remain procedural curves in Three.js.
- Do not generate repeated racks as one room-sized mesh. We will instance one optimized rack asset.

## Shared visual direction

Premium industrial digital-twin realism. Contemporary GCC engineering aesthetic. Precise, calm, high-value, specification-grade rather than sci-fi fantasy. Anthracite powder-coated metal, cool grey aluminium, off-white architectural panels, smoked blue-grey glass, restrained Datacom signal orange accents, tiny cyan/green status LEDs. Clean new equipment with subtle micro-surface variation; no damage, grime, rust, clutter, cyberpunk neon, or exaggerated futuristic forms.

---

## Asset 01 — Hospital exterior shell

**Filename:** `datacom-hospital-shell.glb`

**Role:** The initial hero object. It becomes translucent during the x-ray reveal.

**Target dimensions:** 44 m wide × 28 m deep × 22 m high.

**Target budget:** 35,000–50,000 triangles; maximum 5 material slots; one 2048 px PBR set.

**Required separable parts:** `shell_opaque`, `glass`, `entrance_canopy`, `roof_mep`, `hospital_cross`.

**Geometry prompt — paste into Meshy:**

> Real-time 3D asset of a premium contemporary five-storey GCC hospital, compact rectangular mass 44m wide, 28m deep, 22m high. Strong horizontal facade bands, modular off-white aluminium panels, recessed blue-grey window grid, central double-height glazed entrance and slim canopy, small rooftop MEP screen, simple red-orange medical cross made as separate geometry. Clean architectural proportions, realistic construction thickness, all four sides finished, bottom-centre origin. No site, roads, landscape, people, cars, furniture, signage text, logos, interior rooms, ground plane or background. Game-ready hard-surface geometry with straight edges and restrained bevels.

**Texture/refine prompt:**

> Premium new-build hospital materials: warm off-white matte aluminium facade panels, charcoal shadow gaps, cool smoked blue-grey glazing, brushed dark aluminium frames, light grey concrete base, restrained orange-red medical cross. Physically plausible PBR, consistent clean roughness, subtle panel variation only. Flat studio-neutral albedo with no baked lighting, shadows, reflections, dirt, weathering, text or logos.

**Acceptance test:** Silhouette reads as a hospital at thumbnail size; windows are regular; no warped floors; all four elevations exist; shell can fade without exposing ugly internal caps.

---

## Asset 02 — Empty network-room shell

**Filename:** `datacom-network-room-shell.glb`

**Role:** Backdrop when the camera enters the building. Racks and cables are separate website assets.

**Target dimensions:** 8 m wide × 6 m deep × 3.4 m high.

**Target budget:** 18,000–25,000 triangles; maximum 4 material slots; one 1024–2048 px PBR set.

**Required separable parts:** `room_floor`, `room_walls`, `ceiling_grid`, `overhead_tray`, `door`.

**Geometry prompt:**

> Modular empty enterprise network equipment room for a hospital, 8m x 6m x 3.4m, viewed as a clean three-sided architectural cutaway with the front wall completely removed. Raised access floor with subtle square tile seams, plain light-grey technical walls, dark suspended ceiling grid, two straight overhead ladder cable trays, one closed technical door, simple wall ventilation grilles. Precise realistic dimensions and construction, bottom-centre origin. The room must be empty: no server racks, cables, monitors, desks, people, loose equipment, text, logos, ground plane or background. Clean optimized real-time hard-surface geometry.

**Texture/refine prompt:**

> Clean critical-facility interior: cool light-grey matte walls, graphite raised-floor tiles, dark charcoal ceiling and cable trays, brushed metal door hardware and ventilation grilles. New, maintained, understated industrial PBR materials. No baked light, shadows, dramatic reflections, dirt, warning labels, text or logos.

**Acceptance test:** Front is fully open; camera can see the back wall; no racks are fused into the shell; floor and overhead tray are independently selectable.

---

## Asset 03 — Datacom 42U data-centre rack

**Filename:** `datacom-rack-d07.glb`

**Role:** Repeated four times in the network room and used for the rack fly-in.

**Target dimensions:** 0.8 m wide × 1.2 m deep × 2.05 m high.

**Target budget:** 12,000–18,000 triangles; maximum 5 material slots; one 2048 px PBR set.

**Required separable parts:** `rack_frame`, `front_door`, `rear_door`, `side_panels`, `servers`, `patch_panel`, `pdu`, `status_leds`.

**Geometry prompt:**

> Production-ready 42U enterprise data-centre cabinet, 800mm wide, 1200mm deep, 2050mm high. Premium anthracite powder-coated steel frame, perforated front and rear doors, removable side panels, realistic rack rails and feet. Front door open 105 degrees so the equipment is visible. Populate with eight restrained 1U/2U black servers, one high-density fibre patch panel at upper-middle height, horizontal cable manager and one slim vertical intelligent PDU. Accurate rectangular industrial construction, restrained bevels, separate logical parts, bottom-centre origin. No external cables, room, floor, people, labels, text, logos, excessive screws, sci-fi shapes or background.

**Texture/refine prompt:**

> Premium data-centre equipment PBR: fine-texture anthracite powder-coated rack, near-black server faces, brushed aluminium rail edges, dark perforated steel, tiny restrained cyan and green status LEDs with one Datacom orange accent tab. Clean new hardware, subtle roughness variation and realistic metal response. No baked lighting, dirt, damage, fingerprints, text, numbers, barcodes or logos.

**Acceptance test:** Doors and panels can be hidden; equipment is readable from 2–3 m; perforation is not millions of modeled holes—prefer normal/alpha detail or a simplified pattern.

---

## Asset 04 — 1U high-density fibre patch panel

**Filename:** `datacom-mpo-panel-1u.glb`

**Role:** Close rack detail and parent object for the port hotspot.

**Target dimensions:** 0.483 m wide × 0.30 m deep × 0.04445 m high.

**Target budget:** 6,000–10,000 triangles; maximum 4 material slots; one 1024–2048 px PBR set.

**Required separable parts:** `panel_chassis`, `cassette_01` through `cassette_06`, `adapter_faces`, `port_24`, `release_tabs`.

**Geometry prompt:**

> Accurate real-time 1U 19-inch high-density modular fibre patch panel, 483mm wide, 300mm deep, 44.45mm high. Slim charcoal metal chassis with rack ears, six removable front cassettes, orderly LC duplex adapter openings, subtle horizontal cable-management lip and small release tabs. Port 24 must be a distinct selectable part. Precise manufacturing proportions, clean rectangular topology, restrained edge bevels, centred origin. No rack, cables, loose connectors, labels, printed numbers, text, logos, dust, damage, background or ground plane. Product-visualization quality but optimized for WebGL.

**Texture/refine prompt:**

> Matte charcoal powder-coated metal chassis, satin black cassette faces, cool grey adapter housings, small cyan and green port inserts, one restrained Datacom orange release tab. Clean physically plausible PBR with subtle roughness; no baked shadows, reflections, dirt, labels, numbers, text or logos.

**Acceptance test:** The 1U proportions remain thin; ports are evenly spaced; port 24 is a separate mesh and not fused to the chassis.

---

## Asset 05 — MPO/LC fibre connector and adapter

**Filename:** `datacom-fibre-port-24.glb`

**Role:** Final macro view in the drill-down sequence.

**Target dimensions:** approximately 55 mm long × 14 mm wide × 11 mm high.

**Target budget:** 4,000–7,000 triangles; maximum 4 material slots; one 2048 px PBR set because this asset fills the screen.

**Required separable parts:** `adapter`, `connector_body`, `push_pull_tab`, `ferrule`, `dust_cap`.

**Geometry prompt:**

> Macro product asset of a high-density fibre-optic connector partially inserted into a panel adapter, approximately 55mm long, 14mm wide and 11mm high. Precise injection-moulded connector body, separate adapter sleeve, push-pull release tab, strain-relief boot and tiny ferrule detail. Datacom-style enterprise hardware with realistic tolerances, crisp controlled bevels, clean watertight hard-surface geometry, geometric-centre origin. No cable beyond a short straight 30mm boot, no panel, rack, hands, labels, text, logos, dirt, scratches, glow, ground plane or background.

**Texture/refine prompt:**

> Premium fibre connector materials: cool aqua connector body, dark graphite adapter, satin black strain relief, ceramic-white ferrule, restrained Datacom orange push-pull tab. Fine injection-moulded plastic microtexture, physically plausible roughness and subtle edge response. Clean flat-lit PBR maps with no baked highlights, shadows, fingerprints, labels, text or logos.

**Acceptance test:** Connector silhouette is mechanically believable; ferrule is centred; adapter and release tab are independently selectable; no organic melting or asymmetric deformation.

---

## Optional Asset 06 — Intelligent vertical PDU

**Filename:** `datacom-intelligent-pdu.glb`

**Target dimensions:** 1.75 m high × 0.055 m wide × 0.05 m deep.

**Target budget:** 4,000–6,000 triangles; one 1024 px PBR set.

**Geometry prompt:**

> Slim zero-U intelligent vertical rack PDU, 1750mm tall, 55mm wide, 50mm deep, anthracite metal body with a repeated orderly series of simplified C13 and C19 outlets, small top metering display, network port and mounting brackets. Accurate straight industrial form, modest bevels, repeated outlet geometry optimized, bottom-centre origin. No rack, power cords, cables, labels, text, logos, room, background or ground plane. Clean real-time hard-surface asset.

**Texture/refine prompt:**

> Anthracite powder-coated metal, satin black outlet inserts, dark glass meter display with one restrained cyan indicator and orange status mark. Clean physically plausible PBR, no baked lighting, labels, numbers, text, logos, dirt or damage.

---

## Recommended Meshy settings

### Best-quality route for hard-surface assets

1. Create four consistent reference images: front three-quarter, rear three-quarter, side, and elevated top three-quarter. Use the same object, lens, materials, and neutral background in every image.
2. Submit those images through Multi-Image-to-3D using Meshy 6.
3. Generate the mesh without texture first when possible. Reject bad shape before spending credits on texturing.
4. Use PBR texturing and GLB only.
5. Remesh to a triangle target appropriate for each asset.
6. Run a Blender cleanup/validation pass before importing into the website.

### Suggested request values

| Asset | Method | Target triangles | Texture |
|---|---|---:|---:|
| Hospital shell | Multi-image, Meshy 6, triangle remesh | 45,000 | 2048 |
| Network-room shell | Multi-image, Meshy 6, triangle remesh | 22,000 | 2048 |
| 42U rack | Image-to-3D Smart Topology, Meshy T2 | 15,000 | 2048 |
| 1U patch panel | Image-to-3D Smart Topology, Meshy T2 | 8,000 | 1024–2048 |
| Connector/adapter | Multi-image, Meshy 6, triangle remesh | 6,000 | 2048 |
| Vertical PDU | Image-to-3D Smart Topology, Meshy T2 | 5,000 | 1024 |

For website delivery, request `target_formats: ["glb"]` and `enable_pbr: true`. Do not use 4K textures for the hero; they cost memory without improving the normal viewing distance.

## Reference-image prompt template

Use this template in an image generator before Multi-Image-to-3D. Replace `[ASSET DESCRIPTION]` with the geometry prompt above and `[VIEW]` with one of the four views.

> Orthographic-style industrial product reference of [ASSET DESCRIPTION]. [VIEW]. Entire object visible and centred, consistent real-world proportions, 70mm neutral lens with minimal perspective distortion, neutral light-grey seamless background, soft flat studio lighting, no hard shadows, no depth of field, no crop, no text, no dimensions, no callouts, no environment, no extra objects. Identical design and materials across every view.

Generate these four views:

- Front-left three-quarter
- Rear-right three-quarter
- Exact right side
- Elevated top-front three-quarter

## Blender/web validation checklist

- [ ] Correct physical dimensions in metres
- [ ] Applied transforms: scale `1,1,1`, rotation `0,0,0`
- [ ] Correct origin and Y-up orientation
- [ ] No non-manifold edges, inverted normals, duplicate internal surfaces, or loose geometry
- [ ] Named logical meshes and material slots
- [ ] Triangle budget met without silhouette damage
- [ ] UVs stay inside 0–1 with consistent texel density
- [ ] No baked lighting in base colour
- [ ] Metallic, roughness and normal maps behave correctly under neutral Three.js lighting
- [ ] No texture larger than 2048 px
- [ ] GLB is compressed after approval; retain an uncompressed master separately
- [ ] Final total initial hero payload targets under 8 MB; load rack/port detail progressively

## Files to send back

Place approved files under:

```text
public/models/datacom/
  datacom-hospital-shell.glb
  datacom-network-room-shell.glb
  datacom-rack-d07.glb
  datacom-mpo-panel-1u.glb
  datacom-fibre-port-24.glb
  datacom-intelligent-pdu.glb
```

Also include the Meshy task ID and an uncompressed master GLB for each asset. The website version will be optimized separately so we can regenerate LODs without re-running generation.
