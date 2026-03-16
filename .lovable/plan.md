

## Problem
The hero section uses a split layout which looks awkward, and banner images from putul.fashion already contain baked-in promotional text. Overlaying custom text on top creates visual clutter.

## Solution
Go full-screen with the banner images and let their baked-in text be the hero content. Remove all overlapping headlines, subtitles, and CTA buttons from on top of the image. Add only a minimal "Shop Now" button at the bottom center and slide indicators — no text overlay, no blur, no split.

### Layout
```text
┌──────────────────────────────────────────────┐
│                                              │
│         Full-screen banner image             │
│      (baked-in text is the content)          │
│                                              │
│                                              │
│              [ Shop Now ]                    │
│            01 ─── 03  (dots)                 │
└──────────────────────────────────────────────┘
```

### Changes — `src/components/HeroSlider.tsx`

1. Remove the `grid md:grid-cols-[2fr_3fr]` split layout — make the image full-screen (`min-h-[85svh]`)
2. Remove the left text panel entirely (headline, subtitle, CTA text block)
3. Place the banner image as a full-bleed background with `object-cover`
4. Add a subtle bottom gradient only (transparent to dark) for the bottom controls
5. At the bottom center: a single "Shop Now" button + slide counter/progress bar
6. No blur, no glass panel, no headline overlay

