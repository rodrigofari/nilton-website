# Image Manifest

Every image slot the site uses, defined before any photo arrives. Reserves dimensions, aspect ratios, and focal points so the layout never shifts when real photos drop in. Photos map to slots by **filename** — drop a correctly-named, correctly-sized file into the right folder and it appears.

## Conventions

- **Dimensions** are the largest source size. Smaller widths are generated via `srcset` at the listed breakpoints.
- **Aspect ratio** is enforced in CSS via `aspect-ratio:` on the image's container — hardcoded so layout reservation works even before the image loads.
- **Focal** is `object-position: X% Y%` — the point that must remain visible when the container crops differently across breakpoints. Origin top-left, x = horizontal, y = vertical. Faces typically `50% 30%`. Wave peaks typically `50% 40%`.
- **Format ladder** (per slot, generated when real photos land):
  - `slot-name.avif` — primary (best compression)
  - `slot-name.webp` — fallback
  - `slot-name.jpg` — final fallback (full browser support)
  - Plus widths: `slot-name@1x.{ext}`, `slot-name@2x.{ext}`, etc., as listed per slot.
- **Placeholder URLs** use `picsum.photos` with deterministic seeds. Hitting the same URL always returns the same image at the exact dimensions — zero CLS during dev. Seeds are slot names, so swapping for a real photo is a one-line change.
- **Unsplash search** column gives the query string for curating real surf imagery. Use when upgrading placeholders before client photos arrive.
- **`alt` text** is **not** in this manifest. Alt lives in each locale's HTML (translated per language). Manifest only owns dimensions.

## Filename → real-photo workflow

1. Nilton sends raw photos.
2. Photo audit picks the best fit for each slot.
3. Crop to the slot's exact dimensions and focal point.
4. Export AVIF + WebP + JPG at the listed widths.
5. Drop into the slot's folder using the manifest filename. Done.

---

## Hero

### `hero/hero-desktop`
- **File:** `assets/images/hero/hero-desktop.{avif,webp,jpg}`
- **Dimensions:** 2400 × 1350
- **Aspect ratio:** 16:9
- **Focal:** 50% 45%
- **Widths (srcset):** 1280w, 1920w, 2400w
- **Brief:** Hero shot. Wide framing of a Madeira point break — basalt cliffs left or right, long peeling wave, single surfer on the wave or paddling. Atlantic blues + volcanic black. Late afternoon light preferred. Empty top third for nav + headline overlay (focal compensates).
- **Placeholder:** `https://picsum.photos/seed/hero-desktop/2400/1350`
- **Unsplash search:** `madeira surf cliff point break`

### `hero/hero-mobile`
- **File:** `assets/images/hero/hero-mobile.{avif,webp,jpg}`
- **Dimensions:** 1080 × 1350
- **Aspect ratio:** 4:5
- **Focal:** 50% 40%
- **Widths (srcset):** 720w, 1080w
- **Brief:** Same scene as desktop, recomposed vertical. Surfer/wave should sit in lower-middle so headline + CTA stack cleanly above. Not a crop of the desktop file — different shot, vertical framing.
- **Placeholder:** `https://picsum.photos/seed/hero-mobile/1080/1350`
- **Unsplash search:** `madeira surf vertical portrait wave`

---

## About

### `about/nilton-portrait`
- **File:** `assets/images/about/nilton-portrait.{avif,webp,jpg}`
- **Dimensions:** 1200 × 1500
- **Aspect ratio:** 4:5
- **Focal:** 50% 30%
- **Widths (srcset):** 600w, 900w, 1200w
- **Brief:** Portrait of Nilton. Outdoor, board under arm or in background, ocean visible behind. Eye contact, natural light, friendly but composed (not toothy/sales-y). Crop allows shoulders + upper torso. **Replaces placeholder before launch — flag with `data-placeholder="true"`.**
- **Placeholder:** `https://picsum.photos/seed/nilton-portrait/1200/1500`
- **Unsplash search:** `surfer portrait outdoor ocean`

### `about/nilton-action` *(optional, secondary slot)*
- **File:** `assets/images/about/nilton-action.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 50%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Nilton mid-wave, action shot. Used as a secondary visual in the about section if layout has room.
- **Placeholder:** `https://picsum.photos/seed/nilton-action/1600/1067`
- **Unsplash search:** `surfer action wave bottom turn`

---

## Services *(3 placeholder cards — `data-placeholder="true"` until Nilton confirms)*

### `services/guided-session`
- **File:** `assets/images/services/guided-session.{avif,webp,jpg}`
- **Dimensions:** 1200 × 900
- **Aspect ratio:** 4:3
- **Focal:** 50% 50%
- **Widths (srcset):** 600w, 900w, 1200w
- **Brief:** Single surfer + guide context. Calm framing, suggests one-session vibe. Boards on cliff path, or two figures walking to the water, or one in the lineup with another paddling out.
- **Placeholder:** `https://picsum.photos/seed/svc-guided/1200/900`
- **Unsplash search:** `surf guide lesson coast`

### `services/coaching-intensive`
- **File:** `assets/images/services/coaching-intensive.{avif,webp,jpg}`
- **Dimensions:** 1200 × 900
- **Aspect ratio:** 4:3
- **Focal:** 50% 50%
- **Widths (srcset):** 600w, 900w, 1200w
- **Brief:** Coaching context — surfer on whitewater, instructor pointing/gesturing from beach, or video-review feel. Sense of progression and instruction.
- **Placeholder:** `https://picsum.photos/seed/svc-coaching/1200/900`
- **Unsplash search:** `surf coaching instructor beach`

### `services/surf-trip`
- **File:** `assets/images/services/surf-trip.{avif,webp,jpg}`
- **Dimensions:** 1200 × 900
- **Aspect ratio:** 4:3
- **Focal:** 50% 50%
- **Widths (srcset):** 600w, 900w, 1200w
- **Brief:** Multi-day trip vibe. Boards on car roof, group on cliff overlooking break, or van on coastal road. Sense of adventure / multiple spots.
- **Placeholder:** `https://picsum.photos/seed/svc-trip/1200/900`
- **Unsplash search:** `surf trip van coastline boards`

---

## Spots *(6 signature breaks)*

All spots use the same dimensions for grid consistency. Filenames mirror the canonical spot names — note `paul-do-mar` (no accent, per DECISIONS lock).

### `spots/jardim-do-mar`
- **File:** `assets/images/spots/jardim-do-mar.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 55%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Long peeling right-hander down a basalt boulder beach. Cliffs in background. Empty wave preferred (or one surfer mid-ride).
- **Placeholder:** `https://picsum.photos/seed/spot-jardim/1600/1067`
- **Unsplash search:** `jardim do mar madeira wave`

### `spots/paul-do-mar`
- **File:** `assets/images/spots/paul-do-mar.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 55%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Powerful left, dark water, dramatic cliffs. Heavier, more rock-break feel than Jardim.
- **Placeholder:** `https://picsum.photos/seed/spot-paul/1600/1067`
- **Unsplash search:** `paul do mar madeira left wave`

### `spots/ponta-pequena`
- **File:** `assets/images/spots/ponta-pequena.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 50%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Right-hand point, lined-up walls. Less dramatic cliffs than Jardim/Paul; more open-coast feel.
- **Placeholder:** `https://picsum.photos/seed/spot-ponta/1600/1067`
- **Unsplash search:** `ponta pequena madeira surf`

### `spots/faja-da-areia`
- **File:** `assets/images/spots/faja-da-areia.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 50%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** North-coast spot. Beach-break-ish, wider sand/pebble beach than the south coast points. Different mood — overcast/grey water acceptable.
- **Placeholder:** `https://picsum.photos/seed/spot-faja/1600/1067`
- **Unsplash search:** `madeira north coast surf beach`

### `spots/porto-da-cruz`
- **File:** `assets/images/spots/porto-da-cruz.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 50%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Iconic north coast — Penha de Águia rock formation visible if possible. Black sand, raw Atlantic. Often the brand's "epic Madeira" shot.
- **Placeholder:** `https://picsum.photos/seed/spot-portocruz/1600/1067`
- **Unsplash search:** `porto da cruz madeira penha`

### `spots/machico`
- **File:** `assets/images/spots/machico.{avif,webp,jpg}`
- **Dimensions:** 1600 × 1067
- **Aspect ratio:** 3:2
- **Focal:** 50% 50%
- **Widths (srcset):** 800w, 1200w, 1600w
- **Brief:** Beginner-friendly bay (Nilton's home spot — Ludens Clube de Machico). Calmer, easier waves, town backdrop. Sense of accessibility.
- **Placeholder:** `https://picsum.photos/seed/spot-machico/1600/1067`
- **Unsplash search:** `machico madeira bay beach`

---

## Gallery *(8 slots — mixed crops, magazine-feel grid)*

Mix of landscape and square crops to break grid monotony. Filenames `gallery-01` through `gallery-08`.

| Slot | Dimensions | Ratio | Focal | Brief | Placeholder seed |
|---|---|---|---|---|---|
| `gallery/gallery-01` | 1600×1067 | 3:2 | 50% 50% | Wide spot/landscape | `gal-01` |
| `gallery/gallery-02` | 1080×1080 | 1:1 | 50% 40% | Tight surfer-on-wave action | `gal-02` |
| `gallery/gallery-03` | 1080×1350 | 4:5 | 50% 50% | Vertical lifestyle (boards, sunset) | `gal-03` |
| `gallery/gallery-04` | 1600×1067 | 3:2 | 50% 55% | Empty-wave / "spot envy" | `gal-04` |
| `gallery/gallery-05` | 1080×1080 | 1:1 | 50% 30% | Group/community moment | `gal-05` |
| `gallery/gallery-06` | 1600×1067 | 3:2 | 50% 50% | Coast/cliff drone-style wide | `gal-06` |
| `gallery/gallery-07` | 1080×1350 | 4:5 | 50% 35% | Vertical action — bottom turn / cutback | `gal-07` |
| `gallery/gallery-08` | 1080×1080 | 1:1 | 50% 50% | Detail shot — board, wax, wetsuit, hands | `gal-08` |

- **All gallery widths (srcset):** native + 50%-scaled variant (e.g. 1600 → 800; 1080 → 540).
- **Placeholder URL pattern:** `https://picsum.photos/seed/{seed}/{width}/{height}`
- **Unsplash search (general):** `surf madeira lifestyle wave coast`

---

## Testimonials

### `testimonials/avatar-01` through `avatar-03`
- **File:** `assets/images/testimonials/avatar-{01,02,03}.{avif,webp,jpg}`
- **Dimensions:** 192 × 192
- **Aspect ratio:** 1:1
- **Focal:** 50% 30%
- **Widths (srcset):** 96w, 192w (display size 96px, retina 192px)
- **Brief:** Headshot of the surfer who wrote the testimonial. Casual, outdoors. **All three are placeholders (`data-placeholder="true"`) until real testimonials are collected — at which point each gets the matching surfer's photo.**
- **Placeholder URLs:**
  - `https://picsum.photos/seed/avatar-01/192/192`
  - `https://picsum.photos/seed/avatar-02/192/192`
  - `https://picsum.photos/seed/avatar-03/192/192`
- **Unsplash search:** `portrait headshot outdoor casual`

---

## Open Graph / Twitter cards *(per locale)*

Each locale gets its own OG image — same composition, locale-appropriate text overlay (text rendered on the image, not in HTML, since social platforms don't read overlays from CSS).

| Slot | File | Dimensions | Brief |
|---|---|---|---|
| `og/og-en` | `assets/images/og/og-en.jpg` | 1200×630 | Hero composition + EN tagline overlay |
| `og/og-pt` | `assets/images/og/og-pt.jpg` | 1200×630 | Same + PT-PT tagline |
| `og/og-fr` | `assets/images/og/og-fr.jpg` | 1200×630 | Same + FR tagline |
| `og/og-de` | `assets/images/og/og-de.jpg` | 1200×630 | Same + DE tagline |
| `og/og-uk` | `assets/images/og/og-uk.jpg` | 1200×630 | Same + UK tagline |

- **Aspect ratio:** 1.91:1 (Facebook/Twitter spec)
- **Focal:** 30% 50% (text typically right-side, focal subject left)
- **Format:** JPG only (social platforms don't reliably consume AVIF/WebP for OG)
- **Placeholder:** `https://picsum.photos/seed/og-{locale}/1200/630`
- **Unsplash search:** `madeira surf wave dramatic`
- **Note:** OG images are produced last, after design direction + tagline copy is locked. Rendered via a Figma export or one-off canvas script — not inline.

---

## Icons / favicon

| Slot | File | Dimensions | Notes |
|---|---|---|---|
| `icons/favicon` | `assets/images/icons/favicon.ico` | 32×32 | Multi-resolution `.ico` (16, 32, 48) |
| `icons/favicon-svg` | `assets/images/icons/favicon.svg` | scalable | Modern browsers — preferred |
| `icons/apple-touch-icon` | `assets/images/icons/apple-touch-icon.png` | 180×180 | iOS home-screen icon |
| `icons/icon-192` | `assets/images/icons/icon-192.png` | 192×192 | PWA / Android |
| `icons/icon-512` | `assets/images/icons/icon-512.png` | 512×512 | PWA / Android maskable |
| `icons/maskable-icon` | `assets/images/icons/maskable-icon.png` | 512×512 | PWA maskable safe-zone variant |

- **Brief:** Wordmark or future-mark only. Pending final logo decision — until then, a simple "N" monogram on volcanic-black ground. **`data-placeholder` does not apply (icons are binary assets, not HTML).** Tracked for swap via this manifest entry instead.
- **No placeholder URL** — generated locally from the wordmark/mark when design tokens land.

---

## Pre-launch QA gate

```
grep -r 'picsum.photos' .       # must return zero hits
grep -r 'data-placeholder' .    # must return zero hits
```

Both clean = ready to ship. Any hit = a slot still using a placeholder, blocking deploy.
