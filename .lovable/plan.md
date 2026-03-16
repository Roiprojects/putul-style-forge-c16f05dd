

## Problem

The hero banner images from putul.fashion already contain baked-in text/graphics. The current hero overlays additional headline text on top of these images, causing a messy overlap regardless of gradients or blur panels.

## Solution

Redesign the hero as a **split-layout** — image takes the right portion, text content sits on a solid dark background on the left. This completely eliminates any overlap since text and image occupy separate areas.

### Layout
```text
┌─────────────────────┬──────────────────────────┐
│                     │                          │
│   Gold accent line  │                          │
│   HEADLINE          │     Full banner image    │
│   Subtitle          │     (no overlay)         │
│   [Shop Now]        │                          │
│                     │                          │
│   01 ── 03          │                          │
└─────────────────────┴──────────────────────────┘
  ~40% solid bg            ~60% image
```

### Changes — `src/components/HeroSlider.tsx`

1. Replace the fullscreen image-behind-text layout with a `grid md:grid-cols-[2fr_3fr]` split
2. **Left panel**: Solid `bg-foreground` with the headline, subtitle, CTA buttons, and slide counter — no image behind it
3. **Right panel**: The banner image displayed edge-to-edge with Ken Burns animation, no gradient overlays
4. On mobile: Stack vertically — text on top of a shorter image section, still no overlap
5. Remove the backdrop-blur panel, gradient overlays, and vertical text accent

