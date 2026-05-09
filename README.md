# Nilton Freitas — Surf Guide Madeira

Multi-locale marketing site for Nilton Freitas, freelance surf guide in Madeira, Portugal. Drives bookings via WhatsApp.

Live at **niltonfreitas.surf** (when deployed). Five languages: English, European Portuguese, French, German, Ukrainian.

---

## Tech stack

- **Plain HTML / CSS / JavaScript** — no framework, no build step
- **CSS custom properties** for design tokens (single source of truth in `styles/tokens.css`)
- **Vanilla ES modules** for scripts, lazy-loaded where it makes sense (gallery, FAQ, analytics)
- **Self-hosted woff2 fonts** (Fraunces + Inter, Cyrillic-complete for Ukrainian)
- **Cloudflare Pages** for hosting; locale resolution at the edge via `_redirects`
- **No bundler, no Node dependencies** — `node_modules/` is gitignored defensively but unused

The "no build step" decision is deliberate. Every file in this repo is what gets served. Edit-and-refresh is the entire dev loop.

---

## Project structure

```
nilton_website/
├── index.html                  # root: no-JS language picker fallback (only seen if _redirects doesn't fire)
├── styleguide.html             # internal design-system reference (noindex)
├── _redirects                  # Cloudflare Pages: Accept-Language → /{locale}/
├── _headers                    # Cloudflare Pages: strict CSP, HSTS, cache rules
├── robots.txt
├── sitemap.xml
├── llms.txt                    # AI-crawler summary (LLMs.txt convention)
├── PLAN.md                     # build state, sequence, pre-deploy checklist
├── DECISIONS.md                # architectural decision log
│
├── en/                         # locale homepages — one folder per locale
│   ├── index.html
│   └── privacy/index.html
├── pt/  fr/  de/  uk/          # same structure, mirrored
│
├── content/                    # i18n microcopy (short UI strings, JSON)
│   ├── schema.json             # JSON Schema draft 2020-12 ($schema-bound)
│   └── {en,pt,fr,de,uk}.json   # one file per locale
│
├── styles/                     # CSS — token-driven, no preprocessor
│   ├── tokens.css              # colors, type, space, radii, shadows, motion
│   ├── base.css                # reset, typography, font-face
│   ├── components.css          # btn, nav, lang-switcher, card, field…
│   ├── sections.css            # per-section layouts + mobile drawer + FAB
│   ├── utilities.css
│   ├── privacy.css             # privacy-page-only typographic prose
│   ├── styleguide.css          # styleguide-page-only documentation
│   ├── picker.css              # root language-picker fallback
│   └── main.css                # @imports all of the above
│
├── scripts/                    # ES modules — single entry: main.js
│   ├── config.js               # WHATSAPP_NUMBER, GA_ID, locales
│   ├── i18n.js                 # data-i18n / data-i18n-attr / data-i18n-href binder
│   ├── nav.js                  # sticky scroll, mobile drawer, IO active-section
│   ├── lang-switcher.js
│   ├── consent.js              # GPC honor, banner, localStorage events
│   ├── analytics.js            # GA4 (lazy, post-consent)
│   ├── floating-cta.js         # WhatsApp FAB visibility
│   ├── gallery.js              # lightbox (lazy)
│   ├── faq.js                  # <details> a11y polish (lazy)
│   ├── dom.js                  # $, $$, on helpers
│   └── main.js                 # entry — orchestrates init + lazy boundaries
│
└── assets/
    ├── fonts/                  # self-hosted woff2 (see fonts/README.md)
    └── images/
        ├── MANIFEST.md         # every image slot: dims, ratio, focal, brief, placeholder
        ├── icons/sprite.svg    # inline SVG sprite
        └── {hero,about,services,spots,gallery,testimonials,og}/  # pending real photos
```

---

## Local development

```bash
python3 -m http.server 8000
# then visit:
#   http://localhost:8000/             — language picker
#   http://localhost:8000/en/          — English homepage
#   http://localhost:8000/pt/          — Portuguese homepage
#   http://localhost:8000/fr/          — French
#   http://localhost:8000/de/          — German
#   http://localhost:8000/uk/          — Ukrainian
#   http://localhost:8000/en/privacy/  — privacy page (any locale)
#   http://localhost:8000/styleguide.html — design system reference
```

Note: `_redirects` is **not** processed by `python3 -m http.server` (Cloudflare Pages only). Locally, navigate to `/en/` directly — visiting `/` will show the static language picker fallback.

---

## Locales and locale resolution

| Locale | Path | `<html lang>` | `hreflang` |
|---|---|---|---|
| English | `/en/` | `en` | `en` |
| Portuguese (Portugal) | `/pt/` | `pt-PT` | `pt-PT` |
| French | `/fr/` | `fr` | `fr` |
| German | `/de/` | `de` | `de` |
| Ukrainian | `/uk/` | `uk` | `uk` |

**Architecture:** locale resolution happens at **the edge** (Cloudflare Pages `_redirects`), not in JavaScript. When a user hits `niltonfreitas.surf/`, Cloudflare reads their `Accept-Language` header and 302-redirects to the matching locale. Falls back to `/en/` for unknown languages.

**Why edge, not JS:** SEO + accessibility. JS-based redirects land crawlers and screen readers on a blank shell; edge redirects return localized HTML on the first byte. See `DECISIONS.md` for the full rationale.

**i18n model:**
- **Short UI strings** (nav, buttons, labels, errors) live in `content/{locale}.json`, bound via `data-i18n="key.path"` at runtime by `scripts/i18n.js`.
- **Long prose** (hero copy, bio, FAQ answers, privacy text) lives directly in each locale's `index.html`, addressable via `data-content-id` attributes for cross-locale editing.

---

## Pre-launch QA gates

Before deploy, these greps must return zero hits:

```bash
grep -rn 'picsum.photos' . --include="*.html"      # 0 — placeholders replaced
grep -rn 'data-placeholder' . --include="*.html"   # 0 — placeholder content replaced
grep -rn 'data-missing' . --include="*.html"       # 0 — no missing i18n keys at runtime
grep -ri 'reef' content/ --include="*.json"        # 0 — Madeira has no reef breaks
```

Currently `picsum.photos` and `data-placeholder` show hits — **that's expected**. Both are tracked for pre-launch QA and represent placeholder content (images and prose) awaiting client deliverables (real photos, finalized service descriptions, real testimonials, etc.). Each occurrence is intentional and surfaces in pre-deploy review.

---

## Deploy (Cloudflare Pages)

This repo is deploy-ready as a static site. Cloudflare Pages → connect to GitHub → build command empty, output directory `/`.

### Pre-deploy items (currently outstanding — awaiting client)

- [ ] **woff2 fonts** dropped into `/assets/fonts/` (see `assets/fonts/README.md` for the four required files: Fraunces variable + italic, Inter variable + italic with Cyrillic subset)
- [ ] **Real GA4 Measurement ID** swapped into `scripts/config.js` (placeholder is `G-XXXXXXXXXX` — invalid by design so a forgotten swap shows as a GA rejection in DevTools)
- [ ] **Real photos** placed per `assets/images/MANIFEST.md` slot specs — replaces 32 Picsum URLs + 1 Unsplash hero
- [ ] **Service descriptions** confirmed with Nilton (currently placeholder — `data-placeholder="true"` on each card)
- [ ] **Real testimonials** collected — replace 3 sample testimonials
- [ ] **FAQ answers** confirmed with Nilton — currently working drafts, marked placeholder
- [ ] **About bio** confirmed with Nilton — currently working draft, marked placeholder
- [ ] **DNS** wired in Cloudflare (after deploy)

### Already enforced

- Strict **CSP** from day one — no inline scripts, no inline styles, no `style="..."` attributes (audited, zero hits)
- **GA4 stays uninitialized** until user explicitly accepts; **Global Privacy Control** honored as automatic decline
- **noindex** on `/styleguide.html` layered three ways: `meta` tag + `X-Robots-Tag` header + allowed in `robots.txt` (per the layered-defense rule in `DECISIONS.md`)
- **All WhatsApp links** open in new tab with `rel="noopener"`

---

## Architectural context

- **`PLAN.md`** — build sequence, current state, open items, pre-deploy checklist
- **`DECISIONS.md`** — non-obvious architectural choices with rationale (token-level contrast rules, content-id convention, label-vs-prose split, mobile drawer trap, design-direction reasoning, etc.)
- **`assets/images/MANIFEST.md`** — every image slot the site uses: dimensions, aspect ratio, focal point, content brief, placeholder URL

These three documents are the canonical reference. New contributors should read `DECISIONS.md` first.

---

## License

Proprietary — all rights reserved. Site content, design, and code commissioned by and for Nilton Freitas. Not licensed for redistribution.
