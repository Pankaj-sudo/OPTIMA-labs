# Design

## Theme

Premium aesthetic-wellness / boutique medspa. Light, warm, blush-tinted. Soft shadows, generous whitespace, rounded organic shapes. No dark mode.

## Color Palette — "Rose & Porcelain"

| Token | Hex | Role |
|---|---|---|
| Porcelain | `#FAF6F3` | Page background (blush-tinted white) |
| Rosewater | `#F1E2DB` | Section tints, soft cards, hero wash |
| Muted Rose | `#C08D80` | Primary accent — buttons, highlights, liquid |
| Clay | `#A96A58` | Deep accent — hover, emphasis, links |
| Champagne | `#B79A6B` | Fine gold details: rules, icons, caps/collars |
| Espresso | `#3A2E29` | Headlines & body ink |

Supporting: `#6B5A52` (soft ink for secondary text — passes 4.5:1 on Porcelain), `#FFFFFF` (card surfaces).

Strategy: Committed — rosewater/porcelain carries most of the surface; muted rose leads accents; champagne is the jewelry. No neon, no glows; warmth comes from gradients within the rose/champagne band.

## Typography

- **Headlines:** Prata (Google Fonts) — high-contrast editorial serif, fashion-magazine character. Normal weight only; scale carries hierarchy. Letter-spacing ≥ -0.01em.
- **Body / UI:** Mulish — warm humanist sans. 400/500/600/700.
- Fluid `clamp()` heading scale, hero max ~4.5rem. Body 16–17px, line-height 1.65, max 68ch.

## Motion

- GSAP + ScrollTrigger. Hero sequence: vial fades in → morphs into cartridge → pen glides in → cartridge seats with a gentle settle (soft `power2` / `sine` eases, no hard bounce) → warm champagne bloom on lock → vial returns beside the pen.
- Motion language: graceful and unhurried (durations ~1.0–1.6s, overlapping crossfades). No elastic, no neon glow pulses — soft radial blooms in rose/champagne.
- Full `prefers-reduced-motion` fallback: static composition with simple fade.
- Mobile: simplified two-beat fade (vial + assembled pen).

## Components & Shapes

- Buttons: pill radius (999px), muted-rose fill with espresso-on-rose or white text; ghost variant with 1px clay border.
- Cards: white on rosewater, 24px radius, soft diffuse shadow `0 20px 50px -24px rgba(58,46,41,.18)`.
- Rules/dividers: 1px champagne at low opacity.
- Iconography: thin-line, rounded caps, champagne or clay stroke.
- SVG product art: soft-gradient glass (white/rose sheens), champagne metal, rose liquid — no gunmetal, no cyan.
