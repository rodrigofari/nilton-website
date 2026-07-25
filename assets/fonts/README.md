# Self-hosted fonts

**Status: shipped.** All four woff2 files are committed and live. `styles/base-v2.css`
loads them with no further changes. This file documents how they were built, so they
can be reproduced or regenerated.

## Files

| File | Family | Style | Subsets | Size |
|---|---|---|---|---|
| `Fraunces-Variable.woff2` | Fraunces | upright | latin, latin-ext | ~120 KB |
| `Fraunces-Variable-Italic.woff2` | Fraunces | italic | latin, latin-ext | ~140 KB |
| `Inter-Variable.woff2` | Inter | upright | latin, latin-ext, **cyrillic, cyrillic-ext**, arrows | ~144 KB |
| `Inter-Variable-Italic.woff2` | Inter | italic | latin, latin-ext, **cyrillic, cyrillic-ext**, arrows | ~157 KB |

**Cyrillic is on Inter only** — the UK locale (Ukrainian) must not fall back to system
fonts mid-page. See the known issue at the bottom for what this does *not* cover.

Total ~560 KB on disk, but a visitor only downloads the faces a page actually uses —
`Inter-Variable-Italic` in particular is currently referenced by no rule on any page
(every italic on the site is Fraunces: `.hero h1 em` and `.testimonial blockquote p`).
It's kept so that adding an `<em>` to body copy later doesn't silently produce a
browser-synthesised fake oblique.

## How they were built

Not from [google-webfonts-helper](https://gwfh.mranftl.com/fonts) — that tool ships
static instances, and the design system needs the real variable axes (`opsz` drives
`font-variation-settings: "opsz" 144` on `.display-xl` and `"opsz" 36` on headings and
testimonial quotes).

Source: the upstream variable TTFs from the [google/fonts](https://github.com/google/fonts)
repo (`ofl/fraunces/`, `ofl/inter/`), processed with `fontTools`:

1. **Instanced** with `fontTools.varLib.instancer`:
   - Fraunces' `SOFT` and `WONK` axes pinned at their upstream defaults (`0` and `1`).
     The site never sets them, so pinning is free size savings with identical rendering.
   - `wght` default re-centred on **400** for all four faces. Upstream Fraunces defaults
     to `wght=900` (Black) — a browser that failed to apply the axis would render every
     heading in Black. Re-centring makes the failure mode "Regular", not "wrong".
   - `opsz` kept as a live axis throughout (9–144 Fraunces, 14–32 Inter).
2. **Subset** with `pyftsubset --flavor=woff2`, layout features limited to
   `ccmp,locl,kern,liga,clig,calt,rlig,mark,mkmk,tnum`. Inter's full feature set
   (`ss01`–`ss08`, `cv01`–`cv13`, …) drags in alternate glyphs the site never calls.

### Unicode ranges

The `unicode-range` declarations in `base-v2.css` mirror these files exactly. Two
ranges deviate from the usual Google Fonts defaults, both deliberately:

- **`U+1E00-1EFF` (Latin Extended Additional) dropped.** An audit of every rendered
  string across all 5 locale pages, all 5 privacy pages and all `content/*.json` found
  **181 unique characters and zero** in that block — it is mostly Vietnamese. Carrying
  it cost ~30 KB per face for glyphs no page can render.
- **`U+2190-2193` (arrows) added to Inter.** The privacy pages' "← Back to home" link
  uses `U+2190`, which sat outside every declared range and was silently falling back
  to a system font. Fraunces has no arrow glyphs, so this range is on Inter only.

**Re-run that character audit before changing any range** — new copy can introduce new
characters, and a character outside every `unicode-range` falls back silently.

## Verification

Open `/styleguide.html`. Display headings should render in Fraunces (high-contrast serif
with optical sizing); body text in Inter. If they look like Georgia / system sans, the
files aren't loading — check filenames and paths.

DevTools network tab should show the woff2 fetches as 200 OK with `font/woff2`.

## Known issue — Fraunces has no Cyrillic

Fraunces ships **no Cyrillic glyphs upstream**, so on `/uk/` the display font falls
through the stack to `Cormorant Garamond` / Georgia. Ukrainian headings render in a
different typeface than the other four locales. Body text is unaffected (Inter has full
Cyrillic), so this is cosmetic rather than broken.

Deliberately not actioned: fixing it is a **design decision**, not a bug fix — accept the
fallback, pick a Cyrillic-capable display face for UK only, or change the display face
globally.

## Why self-hosted, not Google Fonts CDN

Two reasons, both in `DECISIONS.md`:

1. **Performance.** Serving from our own origin removes a DNS lookup + TLS handshake.
2. **GDPR.** Fetching from `fonts.googleapis.com` sends the visitor's IP to Google. EU
   jurisprudence (e.g. the 2022 LG München ruling) treats this as a data transfer
   requiring consent. Self-hosting sidesteps the issue entirely.
