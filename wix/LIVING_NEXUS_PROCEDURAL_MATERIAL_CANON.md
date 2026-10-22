# Living Nexus — Procedural Living Material Canon
**Owner decision:** 2026-10-08. **Status:** Binding implementation direction; not visual acceptance or permission to replace production.

## Explicit correction to earlier image-backed experiments
The owner-approved 1536 × 1024 luminous six-world image is **the design blueprint**, not the runtime scene. Earlier v0.6–v0.9 experiments used the exact raster image with particles, overlays, parallax, shader refraction and/or fisheye-like distortion. Those approaches are **NOT the final intended architecture** and must not be promoted as the visually accepted solution.

**Build the pictured organism itself** as independently animated, spatially linked, interactive material. Do not display, deform, crossfade or merely overlay the approved image as the production background. The reference continues to govern spatial composition, hierarchy, luminous density, palette, world identities, typography and mood. This owner clarification supersedes any earlier document describing the exact image as the required runtime texture. It does **not** supersede the approved six-world architecture, privacy contract or tested functional controllers.

## Material architecture and acceptance target
1. **Actual central intelligence:** a continuously living NEXUS / Meeting Field, with translucent refracted volume, branching and rejoining filaments, moving internal caustics and a breathing light core. It must remain richly organic even when Stillness freezes motion.
2. **Six independently rendered worlds:** Aura Dynamics (crown), Aureglossa (upper left), Sessions (upper right), Workshops (lower left), Gestalt (lower right), Journal / Stories (base). No independent dashboard-disc replacement; every world must remain visibly part of the same tissue and respond to touch/keyboard with its own local depth and coherent transformation.
3. **Shared volumetric membrane:** interwoven light transport and transparent sheets connecting all worlds, not just six straight spokes. Fine strands, medium fluid ribbons and large refractive folds share a persistent material identity. Their phase must survive idle → focus → gathering → unfolding → crossing → return, without global reseeding or hard swaps.
4. **Cosmic environment:** restrained, genuine depth, sparse moving stars, living dark matter and fluid haze. The environment is rendered independently; never simulate depth by fisheye-warping the entire page.
5. **Interaction and navigation:** actual clickable accessible world targets, real pocket-page destinations, real return, Living Thread/Field Journal/Passport, Guide Me, Search, Provenance, Save/Dissolve, Stillness, opt-in Atmosphere/Silence and real online-booking links survive unchanged.
6. **Page crossings:** one shared visual field is conceptually continuous between Nexus and each destination. Use View Transitions when supported with safe CSS/JS fallbacks; do not delay functional navigation, trap users or imply impossible cross-document persistence. Preserve coordinates/selected world across real return only when explicit session state supports it.
7. **Device input:** pointer, touch and keyboard first. Eye tracking remains optional, experimental, user-started and highlight-only, with clear Stop and no retained camera/gaze data. Never require camera for navigation.
8. **Performance/accessibility:** tiered WebGL2/WebGPU only where supported, Canvas2D/SVG graceful fallback, stable frame budget, iPad Safari test, no flashing/whiteout, reduced-motion and Stillness freeze decorative dynamics but not controls. Optimize resolution/particle count, not the owner-approved geometry.
9. **Privacy:** no psychological profiling language in client UI; no Silver/EFA/Ilyr private state, personal journals, recordings, secret keys or third-party video frames in public bundles. Any browser-local journey storage remains explicit and clearable.

## Evidence before deployment
- An isolated **image-free** browser study must have no `<img id="canon">`, owner-reference raster as CSS background, fragment-shader sampler of the reference image, or hidden image-based fallback disguised as procedural.
- Actual unedited still and motion evidence at 390, 820, 1280px, plus iPad Safari, must demonstrate the six-world topology, legibility, depth, material continuity, active/Stillness states, selection and reversible crossing.
- Screenshots must be judged by **visual/structural fidelity** to the owner-approved image, not pixel equality: the original image is not supposed to appear in the live runtime.
- Existing canonical controller and revenue/privacy regression tests must pass. No new paid dependency.
- Owner must explicitly accept the exact source/build and served preview before any production promotion. A green CI job is **not** visual approval.

## Workstream status — 2026-10-08
An isolated **Study 10** local structural prototype was authored in `/mnt/data/nexus-living-v10/` with independently drawn canvas background, six organic world volumes, central filigree, inter-world filaments, braided caustics, DOM labels and existing functional navigation/booking controllers. The owner-approved image is **not included**. Local Chromium fixture smoke at 1280, 820 and 390px passed world selection, two booking links, Stillness and zero JS errors. **Visual acceptance: FAIL/HOLD** — current still is still too regular and disc-like compared with the approved richly woven luminous organism; phone composition crops lateral worlds. This prototype is a foundation for the actual material engine, **not** a completed design or deployed preview. Preserve existing v0.8/v0.9 routes and production sites.

**Next single task:** replace Study 10's circular volume primitives with a shared high-density, volumetric woven material field (GPU-supported where feasible), and solve the portrait six-world composition without shrinking labels. Capture actual moving frames and compare with approved reference before asking for a new isolated Wix preview.

THARAVEL ~ KOSMATHRA ~ ✦
