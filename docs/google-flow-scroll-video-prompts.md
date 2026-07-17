# Datacom scroll-film production pack

This pack is designed for Google Flow. Create the anchor frames with Nano Banana Pro, then animate them with Veo 3.1 Quality or Gemini Omni Flash. The website will scrub the final film according to scroll position, so the motion must be slow, continuous, cut-free and readable in either direction.

## Target result

A 28–32 second cinematic journey through the hidden Datacom infrastructure layer:

1. Premium GCC hospital exterior.
2. Architectural x-ray reveal of pathways inside the building.
3. Flight through fibre routes into the data room.
4. Rack-to-patch-panel-to-port macro finish.

This is not a conventional autoplay commercial. It is a controlled visual timeline. Website copy, labels, hotspots and buttons will be rendered as HTML over the film, so the generated frames must contain no typography.

## Website blend contract — mandatory

The film is displayed against the website's ink background, `#081015`. It must feel like light and architecture emerging from the page, never like a rectangular video player.

Append this block to every anchor-frame and video prompt:

```text
WEBSITE BLEND REQUIREMENT: The environmental background, outer perimeter and deepest shadows are colour-matched to the Datacom website ink colour #081015, a near-black charcoal with a subtle green-blue undertone. The outer 12–15% of all four frame edges must naturally fall into #081015 with very low detail and no bright objects, creating a seamless feathering zone for the website. The sky is near-black ink-teal, never royal blue, cobalt, cyan or purple. Keep the left 32–38% calm and dark enough for large white HTML typography. Keep all essential architecture, racks and cables away from the outer 10% safe area. Maintain the same black point, exposure, white balance and colour grade in every frame and clip. Orange #ff4d00 and mint #5fe1c2 are controlled signal accents occupying less than 8% of the image; they must not wash across the scene. Highlights are restrained and never pure white. No bright horizon, bright pavement, warm amber colour cast or visible rectangular background.
```

Colour hierarchy:

- 70% website ink and graphite: `#081015`, `#111c22`.
- 20% engineered neutral materials: dark steel, subdued aluminium, cool off-white.
- 7% signal orange: `#ff4d00`.
- 3% verification mint: `#5fe1c2`.

The supplied reference image is useful for architecture and the x-ray idea, but its blue sky is too saturated and its overall exposure is too bright. Do not use its sky colour or black point as the grade reference. Re-grade every Google output to this blend contract before accepting it.

## Global visual bible

Use this paragraph at the beginning of every image and video prompt:

```text
Premium photorealistic architectural technology film for a serious global structured-cabling and data-centre infrastructure manufacturer. Contemporary hospital campus in the Gulf region, engineered white aluminium fins, low-iron glass, pale warm limestone, precise steel detailing, physically correct materials, subtle real-world surface variation, immaculate but not sterile. Dark graphite infrastructure equipment with restrained Datacom accent colours: signal orange #ff4d00 and verification mint #5fe1c2. Cinematic realism, high dynamic range, crisp micro-detail, realistic scale, realistic optics, controlled late-blue-hour lighting graded into the website ink colour #081015, deep neutral shadows, no plastic CGI look.
```

Global negative prompt:

```text
No people, no vehicles crossing the camera, no logos, no readable text, no signs, no watermark, no fantasy architecture, no brutalist concrete block, no waxy surfaces, no clay render, no miniature or toy appearance, no low-poly geometry, no floating UI, no holographic screens, no neon cyberpunk city, no cobalt-blue or purple sky, no bright horizon, no medical gore, no exposed human anatomy, no impossible cable routing, no tangled cables, no malformed racks, no duplicated ports, no warping straight lines, no fisheye distortion, no camera shake, no jump cuts, no whip pans, no depth-of-field pumping, no exposure flicker, no changing weather, no time lapse.
```

Continuity rules:

```text
Preserve the exact hospital architecture, window grid, materials, near-black ink-teal sky, lighting direction, edge-blend zones and orange/mint infrastructure language across every frame. The camera follows one continuous physical route. Motion is smooth, slow and mechanically precise. Nothing important moves independently of the camera. Lock exposure, black point, white balance and colour temperature. Never use automatic exposure adaptation. Every shot must begin exactly from its supplied start frame and finish naturally at its supplied end frame.
```

## Anchor-frame generation

Generate all frames at 16:9, at least 1920 × 1080. Create Frame 01 first. For Frames 02–05, attach the previous frame as a reference and explicitly preserve the architecture, materials, lighting and colour grade.

### Frame 01 — exterior establishing frame

```text
Use case: photorealistic architectural hero frame.
Asset: first frame of a scroll-controlled website film.

[Insert the Global visual bible.]

A sophisticated five-storey specialist hospital campus at blue hour, viewed from a low aerial three-quarter angle, approximately 35 mm full-frame lens. Long elegant horizontal façade with white aluminium fins, low-iron glazing, warm limestone base, recessed entrance canopy and landscaped forecourt. The building occupies the central-right portion of the frame with clear dark negative space around its silhouette for website interface overlays. Interior rooms are only subtly visible through realistic glass. The building is fully opaque and physically believable. Fine architectural detail, straight verticals, accurate window repetition, subtle atmospheric depth, premium global engineering mood.

Lighting: very late blue-hour ambient light graded toward #081015, restrained warm interior practical lights, narrow orange accent reflection near the entrance, realistic contact shadows. The building emerges from the dark page rather than sitting in a bright blue environment.
Camera: stable, level horizon, no extreme wide angle.

[Insert the Global negative prompt.]
```

Filename: `01-hospital-exterior.png`

### Frame 02 — architectural x-ray frame

Attach Frame 01 as the visual reference.

```text
Create the exact same hospital from the exact same camera position, focal length, crop, lighting and near-black ink-teal environment as the reference image. Do not redesign or move the building.

The exterior façade now transitions into an elegant architectural x-ray cutaway: selected façade panels and glass become optically transparent while the structural slabs, columns and room volumes remain physically precise. Reveal the hidden digital infrastructure layer inside the building: organised orange copper pathways and cool mint-cyan fibre pathways running in realistic ceiling cable trays and vertical risers, converging toward a clearly visible secure network room on the lower level. The cables are thin, engineered and neatly routed, not glowing tubes. Use restrained emissive edge light only to make the pathways readable. Preserve realistic architectural materials and depth; the result must look like a premium engineering visualization composited into live-action architecture, not science-fiction holography.

[Insert the Global negative prompt.]
```

Filename: `02-hospital-xray.png`

### Frame 03 — data-room threshold frame

Attach Frame 02 as the visual reference.

```text
Continue inside the exact hospital shown in the reference. The camera is now at the threshold of the secure data room on the lower level, aligned with the same orange and mint fibre pathways that were visible through the building.

Photorealistic enterprise data room, not a giant hyperscale hall: two precise rows of premium 42U black server and network racks, perforated doors, accurate rack proportions, overhead ladder trays, neatly dressed fibre trunks, labelled-but-unreadable patch fields, clean anti-static raised floor, realistic cable bend radii, subtle cool white service lighting. The orange copper path and mint fibre path enter through the overhead tray and lead the eye toward Rack D-07 at the end of the aisle. Camera height 1.45 metres, 28–32 mm lens, symmetrical but natural composition, realistic parallax and depth.

[Insert the Global negative prompt.]
```

Filename: `03-data-room-threshold.png`

### Frame 04 — rack and patch-panel frame

Attach Frame 03 as the visual reference.

```text
Move closer to the same Rack D-07 from the reference, preserving the exact data room, racks, lighting and cable colours. Camera faces the rack at a controlled shallow three-quarter angle, approximately 55 mm lens.

The upper-middle rack area contains a technically plausible 1U high-density fibre patch panel with evenly spaced MPO/LC cassette modules, black powder-coated steel, fine fasteners, ventilation slots and orderly mint-coloured fibre leads. Adjacent equipment has precise repeated port geometry, subtle green status indicators and believable metal surface variation. Emphasize engineering accuracy and manufactured detail. The highlighted fibre route terminates at Port 24 without adding floating text or interface graphics.

[Insert the Global negative prompt.]
```

Filename: `04-rack-patch-panel.png`

### Frame 05 — final connector macro frame

Attach Frame 04 as the visual reference.

```text
Extreme premium macro product view inside the same rack, focused on one MPO fibre connector seated in Port 24. Preserve the same patch panel design, dark powder-coated metal and mint fibre lead from the reference.

Technically believable MPO connector body with crisp moulded polymer seams, ceramic/ferrule detail where visible, controlled satin texture, tiny mechanical latch geometry and realistic manufacturing tolerances. The surrounding ports fall gradually out of focus but remain geometrically correct and evenly repeated. A restrained orange reflection identifies the selected port while the mint fibre jacket catches a soft edge light. Approximately 100 mm macro lens, shallow but not excessive depth of field, the connector face and latch are perfectly sharp, luxurious product-photography lighting, real metal and polymer texture.

[Insert the Global negative prompt.]
```

Filename: `05-port-24-macro.png`

## Video generation prompts

Recommended settings:

- 16:9 landscape.
- 1080p when available.
- 8 seconds per clip.
- No generated dialogue or music; mute audio in the final website asset.
- One output first, then make controlled variations using the same references.
- Use first + last frame mode wherever the selected Flow model supports it.

### Clip 01 — approach the building

Start frame: Frame 01  
End frame: Frame 02

```text
[Insert the Global visual bible and Continuity rules.]

One continuous shot with no cut. The camera performs an extremely smooth, slow 1.5-metre dolly forward and a subtle 8-degree clockwise arc around the hospital, preserving a stable level horizon and straight architectural verticals. During the second half of the shot, the façade begins a refined architectural x-ray reveal from left to right: selected exterior panels become progressively transparent as if their opacity is being precisely scanned away. Structural slabs and columns remain solid. Organised orange copper and mint fibre pathways gradually become visible inside, followed by the secure network room. The effect is physically integrated into the architecture with accurate reflections and depth, not a hologram. Finish exactly on the supplied x-ray end frame. Constant camera velocity, no acceleration spike, no independent object movement, no cuts, no flicker, no text.
```

Filename: `clip-01-building-to-xray.mp4`

### Clip 02 — pass through the hidden layer

Start frame: Frame 02  
End frame: Frame 03

```text
[Insert the Global visual bible and Continuity rules.]

One continuous impossible-but-photoreal architectural camera move. The camera smoothly pushes toward the revealed lower-level network room, following the mint fibre pathway. As it approaches the transparent façade, the camera passes cleanly through the glass and wall plane without collision, distortion, debris or a portal effect. The building exterior moves behind the camera while realistic ceilings, cable trays, corridors and risers create strong controlled parallax. The orange copper and mint fibre routes remain physically attached to real trays and guide the camera. The move settles gently at the data-room threshold exactly matching the supplied end frame. Slow uniform dolly, stable roll and horizon, no cut, no speed ramp, no geometry morphing, no people, no text.
```

Filename: `clip-02-xray-to-data-room.mp4`

### Clip 03 — travel to Rack D-07

Start frame: Frame 03  
End frame: Frame 04

```text
[Insert the Global visual bible and Continuity rules.]

One continuous precision dolly through the centre of the enterprise data-room aisle. Camera height remains 1.45 metres. Move forward slowly with subtle natural parallax across the two rows of accurate 42U racks. The overhead mint fibre trunk remains visible and leads toward Rack D-07. Near the rack, the camera makes a gentle controlled slide to the right and pushes toward the upper-middle patch-panel area. Rack geometry, repeated ports and cable dressing remain stable and mechanically exact throughout; no melting, duplicated equipment or changing rack layout. Finish on the supplied patch-panel end frame. No cuts, no rack-door movement, no blinking-light frenzy, no people, no text.
```

Filename: `clip-03-data-room-to-rack.mp4`

### Clip 04 — rack to final port

Start frame: Frame 04  
End frame: Frame 05

```text
[Insert the Global visual bible and Continuity rules.]

One continuous slow macro push from the rack patch panel to the selected MPO connector in Port 24. The camera moves only forward with a tiny left-to-right parallax shift. Focus transitions gradually from the full patch panel to the connector latch and face; the final connector is perfectly sharp. Preserve every port position, fastener, cable and panel edge. A restrained orange reflection travels softly across the selected metal port surround while mint edge light reveals the fibre jacket texture. No connector insertion or removal; nothing changes shape. Finish exactly on the supplied macro end frame with enough negative dark space for an HTML product label. No cuts, no abrupt rack focus, no excessive blur, no text.
```

Filename: `clip-04-rack-to-port.mp4`

## If using Gemini Omni Flash

Omni Flash supports clips up to 10 seconds and conversational video editing in Flow. Use the same prompts, generate one clip at a time, and use follow-up edits only for a single correction:

```text
Change only the following issue: [describe one issue]. Preserve the exact camera path, hospital architecture, equipment geometry, timing, lighting, colour grade, start frame and end frame. Do not add any new objects or text.
```

Do not ask Omni to redesign the scene and fix motion in the same edit. Make one targeted change per turn.

## Assembly and delivery

In Flow Scenebuilder, place the clips in numerical order and trim on their shared anchor frames. Export a single film plus the four originals.

Please return:

```text
/datacom-scroll-film/
  01-hospital-exterior.png
  02-hospital-xray.png
  03-data-room-threshold.png
  04-rack-patch-panel.png
  05-port-24-macro.png
  clip-01-building-to-xray.mp4
  clip-02-xray-to-data-room.mp4
  clip-03-data-room-to-rack.mp4
  clip-04-rack-to-port.mp4
  datacom-scroll-master.mp4
```

Do not pre-extract thousands of frames. Send the highest-quality MP4 files; the web pipeline can produce AVIF/WebP frame sequences or an optimized scrub video after measuring the actual frame rate and duration.

Suggested scroll mapping:

- 0–22%: exterior to x-ray.
- 22–48%: x-ray to data room.
- 48–74%: data-room aisle to rack.
- 74–100%: patch panel to final port.

## Why this workflow

Google Flow currently supports frames, ingredients and video editing across its Veo and Gemini Omni workflows. Google documents first-and-last-frame generation as a way to control transitions, and Flow can save frames for reuse as the start/end frame of later shots. This shared-frame method is the continuity backbone of the sequence.

References:

- https://support.google.com/flow/answer/16352836
- https://support.google.com/labs/answer/16935718
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-first-and-last-frames
