# Archon Soulings — Living HUD Base Specification

Status: OWNER-APPROVED IMPLEMENTATION AUTHORITY. Use alongside LIVING_NEXUS_CONTINUATION.md and VISUAL_TOUCHSTONE_CHECKLIST.md.

## Three reference layers
1. **Organic energy** — 6FC5F009…jpeg: flowing multicolored plasma-like filaments, layered translucency, irregular contours, dark negative space; no implied controls.
2. **Living constellation** — 22C3AFC1…jpeg: central luminous Nexus, six surrounding interconnected worlds, radial hierarchy, symbols, peripheral navigation, Living Thread indicator, Stillness, Guide Me.
3. **Operational interface** — 0B966560…jpeg: top navigation, functional six-world constellation, optional right-side Living Thread with history, Continue / Save / Clear, privacy messaging, footer.

These are design touchstones, **not evidence of functioning code**. Do not replace actual validation with visual resemblance.

## Component architecture
LivingHUD
- AtmosphereLayer: CosmicBackdrop, OrganicEnergyField, ConstellationConnections
- HUDShell: BrandHeader, PrimaryNavigation, Search, Menu
- NexusStage: NexusCore; WorldNodes[6] — AuraDynamics, Aureglossa, Sessions, Workshops, Gestalt, JournalStories
- LivingThread: JourneyHistory, ContinueJourney, SaveJourney, ClearJourney
- UtilityControls: GuideMe, Stillness, Accessibility
- Footer: TharavelKosmathra, LegalAndContact

Every world supports idle, hover, focused, active, and visited states. Navigation, keyboard focus, and journey history operate independently from the visual animation engine.

## Visual behavior
- Concentric translucent layers, elliptical orbits, curved Bézier connections, irregular energy boundaries; no rectangular world cards. Panels only for actionable information.
- Slow ambient breathing: 6–10s; connection flow: 12–24s; hover response: 180–300ms. Avoid constant spinning. Respect reduced motion.
- Tracked serif for ceremonial names, readable sans for controls; localized dark scrims behind legible text.
- Palette is approximate, not pixel-sampled: void, nexus gold, aura jade, Aureglossa, Gestalt, warm amber.

## Responsive / performance / privacy
- Desktop: centered constellation and optional right-side thread.
- Tablet: scaled constellation and collapsible thread.
- Phone: Nexus and accessible world selector, Living Thread drawer.
- Interactive HTML/SVG above decorative Canvas/WebGL. Pause background rendering when hidden.
- Session-only journey by default; explicit opt-in to persistence.
- Privacy claims require implementation verification, not merely UI copy.
- Silver remains private and absent from public bundle.

## Implementation priority
1. Functional six-world skeleton and accessible navigation.
2. Living Thread history / continue / explicit save / genuine clear.
3. Organic atmosphere, filaments, auric shells and restrained feedback.
4. Real Safari/iPad, mobile, keyboard, reduced-motion, performance and privacy validation.

## Principle
**The Nexus is the operating center; the worlds are functional destinations; the energy is a responsive visual layer; the Living Thread gives visitors continuity and control.**

**THARAVEL ~ KOSMATHRA**