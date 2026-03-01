# Visual Language Reference

This document defines the imagery style for all blog and site visuals. It should be treated as a brief given to any image-generation tool or human illustrator. Every image produced for this site should be traceable back to these rules.

---

## 1. Philosophy

Each image makes a single argument. It does not decorate a page or summarise a topic — it takes a position on it. The method is always the same: take one familiar physical object, give it an impossible or distorted hybrid quality that mirrors the article's thesis, and render it in isolation against a flat background. The image should be legible and provocative at thumbnail scale before a reader has seen a single word of the article. No titles, no charts, no literal illustration of the subject matter.

---

## 2. Color Palette

These values are fixed across all imagery. Deviation from the background color in particular will break visual cohesion.

| Role | Color | Hex |
|---|---|---|
| Background | Deep Emerald Green | `#0A5C36` |
| Primary object | Matte Terracotta / Dusty Salmon | `#C47A5A` (approximate; warm, desaturated) |
| Accent / contrast | Polished Gold | `#D4A017` |
| Neutral highlight | Off-white | `#F8F5F0` |

**Rules:**
- The background is always the flat emerald green. No gradients, no textures, no vignettes.
- Each image uses exactly one "precious" accent material (gold, glass, polished chrome). A second accent should never be introduced.
- The primary object sits in the warm matte family. Avoid cool or highly saturated primaries — they fight with the background.

---

## 3. Composition

- **One hero object.** The entire frame is dedicated to a single object. It is centered with generous breathing room on all four sides — roughly 15–20% padding from each edge.
- **Isometric perspective.** The camera sits at approximately 30° elevation on the standard isometric axis. No forced perspective, no ultra-wide lens distortion.
- **No text.** No titles, labels, annotations, watermarks, or UI overlays in the image itself.
- **Silhouette legibility.** The object must read instantly as a distinct shape at 300×200px (card thumbnail size on mobile). If the silhouette is ambiguous at that scale, the composition fails.
- **No busy backgrounds.** No gradients, shadows cast onto the background, grid lines, or secondary elements floating in the scene. The background is pure color.

---

## 4. Material Language

Two materials appear in every image, and only two:

| Material | Role | Properties |
|---|---|---|
| Matte warm solid | Primary object | Flat-shaded, slightly warm undertone, no specularity, soft ambient shading only |
| Polished precious | Accent element | High specularity, reflective, visibly different in texture from the primary |

The contrast between these two materials — one dull and structural, one bright and valuable — is the visual engine of every piece. The precious material (gold coins, a glass vial, a chrome dial) represents the thing being consumed, transferred, or at risk. The matte material represents the structure doing the consuming or constraining.

---

## 5. Lighting

- Soft, diffuse studio lighting. Think a large softbox slightly above and to the left.
- Gentle ambient occlusion only — enough to read the 3D form of the object, not enough to cast a visible drop shadow onto the background.
- No hard shadows, no rim lights, no dramatic under-lighting.
- The scene should feel like a clean product render, not a cinematic shot.

---

## 6. Concept Rules

These govern how a new thumbnail concept should be developed from an article:

1. **Identify the core mechanism, not the topic.** The topic of an article might be "housing affordability" but the mechanism might be "wages are being consumed." Build the image around the mechanism.

2. **Find the hybrid object.** The image is always a familiar object made strange by merging it with something it should not be. A house that is also a piggy bank. A vice whose jaws are shaped like a house. The hybrid should be immediately parseable — both halves should be recognisable — but the combination should feel slightly wrong.

3. **Choose a state of stress.** Neutral objects are boring. The object should be straining, cracking, overloaded, overflowing, or tipping. This is what makes the image argumentative rather than illustrative.

4. **Avoid:** charts, maps, flags, literal photographs, recognisable people or faces, text of any kind, and any imagery that requires reading to understand.

---

## 7. Prompt Template

Copy this block and fill in the bracketed fields for each new thumbnail.

```
Subject: A minimalist 3D isometric illustration of [THE HYBRID OBJECT — describe both halves, e.g. "a bench vice whose jaws are shaped like a house silhouette"].

Action / State: [Describe the stress state, e.g. "The vice is clamped tight, squeezing a stack of gold coins that are buckling under the pressure."]

Key Detail: [Any specific visual detail that encodes the argument, e.g. "The jaws leave a house-shaped indent in the coin stack."]

Art Style: High-end editorial 3D render. Clean, smooth matte textures. Toy-like but serious in tone. Similar to 3D illustrations used by The Economist or Linear. No photorealism.

Lighting: Soft, diffuse studio lighting with gentle ambient occlusion. No harsh shadows. Enough depth to read the 3D form clearly.

Materials:
- Primary object: Matte terracotta / dusty salmon. Flat-shaded, warm, no specularity.
- Accent element: [Gold coins / polished chrome / clear glass — pick one]. High specularity, visibly precious.

Colors:
- Background: Deep solid emerald green, hex #0A5C36. Flat fill, no gradients, no textures.
- Primary object: Matte terracotta / dusty salmon.
- Accent: Polished gold.

Camera: Isometric view, approximately 30° elevation. Object centered with generous breathing room on all sides — roughly 15–20% padding from each edge.

Constraints: No text. No labels. No secondary objects. No background elements. No drop shadows on the background. Clean silhouette readable at small thumbnail size.

Aspect ratio: 16:9 (1200×675px or equivalent).
```

---

## 8. Example Prompts

### "The Savings Eater" — `ireland-property-economy`

> **Subject:** A minimalist 3D isometric illustration of a hybrid object: a traditional terracotta piggy bank that is simultaneously a detached Irish semi-detached house with a pitched roof, windows, a front door, and a chimney. The chimney doubles as the piggy bank's coin slot and has a funnel shape. The house-pig has a snout, small ears, and stubby legs.
>
> **Action / State:** Gold coins stamped with the word "SAVINGS" are raining down into the chimney-funnel from above. The body of the house-pig is visibly cracked and stressed, with hairline fractures across the terracotta surface, suggesting it is close to breaking.
>
> **Key Detail:** The cracks radiate from the midsection, as if the object has been overfilled. One of the pig's legs is slightly splayed, suggesting instability.
>
> **Art Style:** High-end editorial 3D render. Clean, smooth matte textures. Toy-like but serious in tone. Similar to 3D illustrations used by The Economist or Linear. No photorealism.
>
> **Lighting:** Soft, diffuse studio lighting with gentle ambient occlusion. No harsh shadows. Enough depth to read the 3D form clearly.
>
> **Materials:**
> - Primary object: Matte terracotta / dusty salmon. Flat-shaded, warm, no specularity.
> - Accent element: Polished gold coins. High specularity, visibly precious.
>
> **Colors:**
> - Background: Deep solid emerald green, hex `#0A5C36`. Flat fill, no gradients, no textures.
> - Primary object: Matte terracotta / dusty salmon.
> - Accent: Polished gold.
>
> **Camera:** Isometric view, approximately 30° elevation. Object centered with generous breathing room — roughly 15–20% padding from each edge. Object positioned slightly left of center to give the falling coins visual breathing room on the right.
>
> **Constraints:** No text. No labels. No secondary objects. No background elements. No drop shadows on the background. Clean silhouette readable at small thumbnail size.
>
> **Aspect ratio:** 16:9 (1200×675px).

---

### "The Wage Vice" — `ireland-housing-market`

> **Subject:** A minimalist 3D isometric illustration of a heavy industrial bench vice. The two metal jaws of the vice are shaped so that, when closed, they form the negative space silhouette of a simple house with a pitched roof.
>
> **Action / State:** The vice is clamped tight, squeezing a tall stack of gold coins. The coins in the center of the stack are visibly buckling and bending under the pressure.
>
> **Key Detail:** The house-shaped gap between the jaws is clearly legible even while the vice is clamped. The coins deform in a way that mirrors the house outline.
>
> **Art Style:** High-end editorial 3D render. Clean, smooth matte textures. Toy-like but serious in tone. Similar to 3D illustrations used by The Economist or Linear. No photorealism.
>
> **Lighting:** Soft, diffuse studio lighting with gentle ambient occlusion. No harsh shadows. Enough depth to read the 3D form clearly.
>
> **Materials:**
> - Primary object: Matte slate grey / dark navy for the vice body. Flat-shaded, cool, no specularity.
> - Accent element: Polished gold coins. High specularity, visibly precious.
>
> **Colors:**
> - Background: Deep solid emerald green, hex `#0A5C36`. Flat fill, no gradients, no textures.
> - Primary object: Matte slate grey.
> - Accent: Polished gold.
>
> **Camera:** Isometric view, approximately 30° elevation. Object centered with generous breathing room on all sides — roughly 15–20% padding from each edge.
>
> **Constraints:** No text. No labels. No secondary objects. No background elements. No drop shadows on the background. Clean silhouette readable at small thumbnail size.
>
> **Aspect ratio:** 16:9 (1200×675px).
