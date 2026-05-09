# Nilton Freitas — Surf Guide Madeira: Build Plan

Marketing site for Nilton Freitas, surf guide in Madeira, Portugal. Single page per locale, drives bookings via WhatsApp.

## Stack (locked)
- Plain HTML, CSS, JavaScript. No framework, no build step.
- CSS custom properties for design tokens.
- Vanilla JS, ES modules.
- Deployed to Cloudflare Pages.
- GitHub repo, deploy-ready structure from day one.

## Scope — single-page sections
1. Hero (primary "Book Now" CTA → WhatsApp)
2. About Nilton (bio, certifications, achievements, years guiding)
3. Services (surf guide packages — placeholder until client provides)
4. Madeira spots (Jardim do Mar, Paul do Mar, Ponta Pequena, etc.)
5. Gallery (Unsplash placeholders mapped to manifest)
6. Testimonials
7. FAQ
8. Contact / Book Now (WhatsApp redirect)
9. Footer (Instagram `@niltonfreitaas` → `https://instagram.com/niltonfreitaas`, Facebook slot reserved)

Plus `/{locale}/privacy/` — one privacy policy page per locale, linked from footer and consent banner.

## Locales (5)
English, Portuguese (PT-PT — European, not Brazilian), French, German, Ukrainian (`uk`, the ISO 639-1 language code — not `ua`, which is a country code).
Folder-per-locale URLs: `/en/`, `/pt/`, `/fr/`, `/de/`, `/uk/`. Short paths; full BCP-47 lives in `<html lang>`, `hreflang`, and `_meta.locale`.
Root `/` → `_redirects` resolves via `Accept-Language` (Cloudflare-side, not JS).
`index.html` at root is no-JS fallback with manual language picker.

**Translation workflow:** Claude-driven. PT source → Claude → EN/FR/DE/UK. Each locale file carries a `_meta` block (`locale`, `direction`, `last_updated`, `translator`) for provenance.

## Content split
- **Short UI strings** (nav, buttons, form labels, errors) → `content/{locale}.json`.
- **Long prose** (hero copy, about bio, FAQ answers) → directly in each locale's `index.html`. No JSON escaping for rich text.
- Translators get IDE validation via `$schema` reference in each JSON.
- All string values required. Empty string = missing translation (flaggable). Absent key = silent bug (forbidden).
- Schema nesting: 2 levels max. `nav.book_now`, not `sections.hero.cta.primary.label`.
- No ICU MessageFormat. No runtime pluralization. v1 is pure static.

## Project structure (current state)
```
nilton_website/
├── PLAN.md                     # this file — build state + open items
├── DECISIONS.md                # log of non-obvious architectural choices
├── .gitignore                  # ignores .claude/, .DS_Store, .env, etc.
│
├── styleguide.html             # internal: design system reference (noindex meta)
│
├── en/
│   ├── index.html              ✅ shipped (canonical EN, data-content-id retrofit)
│   └── privacy/index.html      ✅ shipped (GDPR template, non-binding disclaimer)
├── pt/index.html               ✅ shipped (homepage; privacy pending)
├── fr/index.html               ✅ shipped (homepage; privacy pending)
├── de/index.html               ✅ shipped (homepage; privacy pending)
├── uk/index.html               ✅ shipped (homepage; privacy pending)
│
├── content/
│   ├── schema.json             # JSON Schema draft 2020-12, $schema-bound
│   ├── en.json                 # canonical microcopy (Title Case CTAs)
│   ├── pt.json                 # PT-PT, post-AO90, tu register
│   ├── fr.json                 # tu register
│   ├── de.json                 # du register
│   └── uk.json                 # ти register, glossary in Latin script
│
├── styles/
│   ├── tokens.css              # design tokens — single source of truth
│   ├── base.css                # reset, typography, a11y defaults, font-face
│   ├── components.css          # btn, site-nav, lang-switcher, card, field, etc.
│   ├── sections.css            # per-section layouts + mobile drawer + FAB
│   ├── utilities.css           # visually-hidden, prose, [data-missing] red rule
│   ├── main.css                # @imports tokens → base → components → sections → utilities
│   ├── privacy.css             # privacy-page-only typographic prose layout
│   └── styleguide.css          # styleguide-page-only documentation styles
│
├── scripts/
│   ├── config.js               # WHATSAPP_NUMBER, GA_ID, LOCALES, CONSENT_KEY
│   ├── dom.js                  # $, $$, on helpers
│   ├── i18n.js                 # data-i18n / data-i18n-attr / data-i18n-href binder + {year}
│   ├── nav.js                  # sticky scroll state, mobile drawer, IO active-section
│   ├── lang-switcher.js        # dropdown, Esc, click-outside, persistence
│   ├── consent.js              # GPC honor, banner, localStorage, custom events
│   ├── analytics.js            # gtag.js loader (lazy, post-consent only)
│   ├── floating-cta.js         # WhatsApp FAB visibility (IO on contact section)
│   ├── gallery.js              # lightbox: Esc, arrows, backdrop close (lazy)
│   ├── faq.js                  # <details> aria-expanded mirror (lazy)
│   └── main.js                 # ES module entry — orchestrates init + lazy boundaries
│
├── assets/
│   ├── fonts/
│   │   └── README.md           # woff2 inventory + download instructions (files not committed)
│   └── images/
│       ├── MANIFEST.md         # every image slot: dims, ratio, focal, brief, placeholder URL
│       ├── icons/
│       │   └── sprite.svg      # inline-SVG sprite (chevron, arrows, social, close, whatsapp)
│       ├── hero/               # hero shots — empty (Unsplash placeholders inline)
│       ├── about/              # portrait — empty (Picsum placeholder)
│       ├── services/           # 3 service cards — empty (Picsum)
│       ├── spots/              # 6 spots — empty (Picsum)
│       ├── gallery/            # 8 gallery — empty (Picsum)
│       ├── testimonials/       # 3 avatars — empty (Picsum)
│       └── og/                 # 5 OG images per locale — empty (referenced in <head>)
│
└── (queued — 4c)
    ├── index.html              # root: no-JS language picker fallback
    ├── robots.txt              # allows styleguide.html crawl (meta noindex layered)
    ├── sitemap.xml
    ├── llms.txt
    ├── _redirects              # CF Pages: Accept-Language → /{locale}/
    ├── _headers                # CF Pages: CSP, cache-control, X-Robots-Tag for styleguide
    └── pt|fr|de|uk/privacy/    # 4 locale privacy pages (after translation pass)
```

## Cross-cutting requirements

### SEO
Per-locale `<title>`, meta description, Open Graph, Twitter cards. `sitemap.xml`, `robots.txt`, `hreflang` alternates on every locale page. JSON-LD: `LocalBusiness` + `Person` + `Service`.

### LLM-readable
`llms.txt` at root — increasingly load-bearing for travel/service businesses.

### Analytics + consent
GA4 with EU cookie banner. GA stays uninitialized until consent. GA ID is a config variable.

### Accessibility
Semantic HTML, alt text per locale, full keyboard navigation, `prefers-reduced-motion`, WCAG AA contrast.

### Performance
Lighthouse 95+. AVIF/WebP with JPG fallback, lazy-load below fold, preload hero assets. Self-hosted fonts (no Google Fonts CDN — perf + GDPR).

### Security headers (CSP — strict from day one)
- No inline scripts, ever. External files or nonces only.
- No inline styles, ever.
- Future whitelists for embeds (Instagram, GetYourGuide) are `connect-src` / `frame-src` additions only.

### Styleguide noindex (layered)
- `robots.txt`: **allow** (so crawlers can see the meta tag — `Disallow` would create the paradox where the page gets indexed from external links without content).
- `<meta name="robots" content="noindex, nofollow">` in HTML.
- `X-Robots-Tag: noindex, nofollow` header in `_headers`.

### Image manifest
Every image slot defined before any photo arrives:
- Slot name, exact dimensions, aspect ratio
- Focal point (`focal: X% Y%`) for `object-position` art direction across breakpoints
- Content brief (what the photo should show)
- Current Unsplash placeholder with `?w=` size param matching final dimensions
- Real photos map by filename when they land. No layout shift, no resizing chaos.

## Design system (built after content schema lands)
- `tokens.css`: colors (primary/secondary/accents/neutrals/semantic), type scale, spacing scale, radii, shadows, motion/easing.
- Typography: TBD until client locks design direction.
  - "Sporty & Bold" → Bebas Neue / Bricolage Grotesque + Inter
  - "Clean & Premium" → Fraunces + Inter / General Sans
- Components: buttons (primary/secondary/ghost), nav, language switcher, cards, section wrappers, form inputs.
- `styleguide.html` documents all tokens + components for client review.

## Design direction
Between "Clean & Premium" (luxury surf travel) and "Sporty & Bold" (high-contrast, energetic, action-focused). Madeira-rooted: volcanic black, Atlantic blues, basalt textures, big surf photography. Premium with energy — not generic surf school, not stiff luxury hotel.

## Brand assets status
- **Logo:** undecided. Wordmark only for now (his name in chosen display font). Layout reserves a ~40×40 mark slot left of the wordmark — collapses cleanly via CSS `gap` when empty.
- **Photos:** none. All imagery is Unsplash placeholder. Photo audit with client after design direction locked.
- **Brand colors:** none. Picked from scratch with Madeira palette.
- **Social:** Instagram `@niltonfreitaas` for footer link only (robots-blocked, no embed).

## Booking
WhatsApp redirect → `https://wa.me/351966236416` with prefilled message localized per language.

## Build sequence
1. **Content JSON schema** + EN placeholder + scaffolded PT/FR/DE/UK ✅ shipped
2. **Image manifest** (`assets/images/MANIFEST.md`) ✅ shipped
3. **Design tokens** + `styleguide.html` ✅ shipped
4. **HTML skeleton** + i18n plumbing
   - **4a — EN locale + scripts + sections.css + utilities.css + EN privacy** ✅ shipped
   - **4b — PT/FR/DE/UK locale pages + privacy × 5** ✅ shipped (9 mechanical content-id replaces from translation pack + 4 locale privacy pages with `data-content-id` markers)
   - **4c — `_redirects`, `_headers`, `robots.txt`, `sitemap.xml`, `llms.txt`, root `index.html` + `styles/picker.css`** ✅ shipped
5. **Pre-deploy checklist** — see below; awaits client deliverables (woff2 fonts, real GA4 ID, real photos)

---

## Step 4a — closed

All bug fixes from review:
- Sticky nav (`html, body { height: 100% }` removed → `min-height: 100%`)
- Hero overlay strengthened, navy `background-color` fallback added
- `.btn--on-media` modifier for hero secondary CTA
- Hover contrast on `.btn--primary` and `.btn--accent` (cream-on-terracotta sub-AA → navy-on-terracotta) — DECISIONS entry covers the rule
- FAB visible immediately on page load
- WhatsApp brand green colors on FAB (#25D366 / #128C7E)
- `.section--dark .eyebrow` color override (gold-soft) — fixes invisible Reviews eyebrow on dark sections
- Mobile nav restructure: lang-switcher inside drawer, actions group on bar
- Mobile drawer slides in from right with backdrop tap-to-close
- `backdrop-filter` desktop-only on `.site-nav` (mobile drawer was trapped inside the nav bar's containing-block — see DECISIONS)
- Mobile hero photo swapped to a different Unsplash composition
- Madeira break-type vocabulary (no "reef breaks") — DECISIONS entry locks the spot-type mapping
- Bold weight on `services.disclaimer` and `contact.response_time`
- Hamburger swaps to ✕ on drawer open (CSS-only via `[aria-expanded="true"]`)
- Book Now CTA appended inside the mobile drawer (`.site-nav__list-cta-wrapper`)
- EN microcopy title-cased: `See Services`, `Plan Your Session`, `Book This` — DECISIONS entry codifies the EN-Title-Case-only convention
- All `wa.me` links open in a new tab (`target="_blank" rel="noopener"`)
- Burger icon anchored to right edge on mobile (flex `space-between` overrides desktop grid)

**EN privacy page** — `/en/privacy/index.html` — drafted with GDPR template, non-binding disclaimer, 9 sections. Loads `styles/privacy.css` for typographic prose layout.

---

## Step 4b — in progress

### Architectural additions during 4b
- **`data-content-id` convention** — every block of inline prose carries a stable address (`hero.headline`, `about.bio.p2`, `spots.jardim.desc`, `faq.4.q`, etc.). Same ID across all 5 locales. Documented in DECISIONS.
- **Testimonial city labels** localized per language with `data-content-id="testimonials.{N}.city"` — Lisbon/Lisboa/Lisbonne/Lissabon/Лісабон, etc. DECISIONS entry covers the rule.
- **PT-PT post-AO90 spelling** locked (`atual`, `proteção`, `exceto`, `ação`). DECISIONS entry + applied to pt.json + pt/index.html.
- **`services.eyebrow` migrated from inline to JSON** — was 15 hardcoded `<span class="card__eyebrow">…</span>` occurrences across 5 locale pages × 3 cards. Now one JSON key per locale, bound via `data-i18n="services.eyebrow"`. DECISIONS entry codifies the labels-in-JSON convention with audit + pre-launch grep gate.
- **`fr.json` Madère → Madeira sweep** (12 occurrences) — earlier translation pass had used "Madère" before the glossary lock; fixed.
- **5-locale hreflang alternates** added to EN head (en, pt-PT, fr, de, uk, x-default).

### Locale homepages built
- `pt/index.html` — full mirror with translated prose, post-AO90 spellings, localized cities, content-ids
- `fr/index.html` — same
- `de/index.html` — same
- `uk/index.html` — same

### Open items in 4b (awaiting user)
**Reconstructions to re-translate** (29 total — flagged because user-provided paste was truncated mid-word in many places). Format: `locale · content-id · text` requested in return.

| Locale | Count | Items |
|---|---|---|
| PT | 5 | `about.bio.p3`, `spots.ponta-pequena.desc`, `testimonials.2.quote`, `faq.4.q`, `faq.4.a` |
| FR | 6 | `about.h2`, `services.coaching.desc`, `spots.faja-da-areia.desc`, `testimonials.3.quote`, `faq.5.q`, `faq.5.a` |
| DE | 5 | `hero.lede`, `services.guided.desc`, `spots.faja-da-areia.desc`, `testimonials.3.quote`, `faq.4.a` |
| UK | 13 | `hero.lede`, `about.bio.p2`, `about.bio.p3`, `spots.paul.desc`, `testimonials.2.quote`, `testimonials.3.quote`, `faq.1.q`, `faq.1.a`, `faq.4.q`, `faq.4.a`, `faq.5.q`, `faq.5.a`, `faq.6.q` |

**Privacy disclaimers to re-translate** — all 4 locales had truncated disclaimers in the user-provided paste. EN canonical exists; PT/FR/DE/UK awaiting clean translations.

**Optional `nav.back_to_home` migration** — currently inline as `← Back to home` on EN privacy page. Will become JSON-bound when locale privacy pages are built. Translations needed: PT/FR/DE/UK.

### Sequence to close 4b
1. User returns clean translations (29 reconstructions + 4 disclaimers + optional `nav.back_to_home` × 4)
2. Mechanical content-id replaces in pt/fr/de/uk homepages (first real test of the content-id system)
3. User spot-checks one locale homepage
4. Build privacy pages × 4 with disclaimers + `nav.back_to_home` JSON-bound
5. 4b closed → 4c

---

## Step 4c — queued

- `_redirects` (Cloudflare Pages) — Accept-Language → `/{locale}/`
- `_headers` — strict CSP, `X-Robots-Tag: noindex` for `/styleguide.html`, cache-control
- `robots.txt`
- `sitemap.xml` — covers homepages + privacy pages (10 URLs)
- `llms.txt`
- Root `index.html` — no-JS language picker fallback for when `_redirects` doesn't fire

---

## Pre-deploy checklist (will be enforced before 4c ships)
- [ ] woff2 fonts present in `/assets/fonts/` (per `assets/fonts/README.md`)
- [ ] Real GA4 Measurement ID swapped into `scripts/config.js` (placeholder is `G-XXXXXXXXXX`)
- [ ] Real photos placed (replaces Picsum URLs and Unsplash hero)
- [ ] `grep -rn 'picsum.photos' .` → zero hits
- [ ] `grep -rn 'data-placeholder' .` → zero hits
- [ ] `grep -ri 'reef\|récif\|riff\|риф' content/ */index.html` → zero hits
- [ ] `grep -rn 'data-missing' .` → zero hits
- [ ] Production HTML eyebrow gate: `grep -rn '<span class="card__eyebrow">[A-Za-z]' --include="*.html" --exclude="styleguide.html"` → zero hits
- [ ] All 5 locale homepages render without `[key.path]` red-outlined missing keys
- [ ] WhatsApp links all open new tab (`target="_blank" rel="noopener"`)

## Decision log
Detailed rationale for non-obvious choices lives in `DECISIONS.md` (created in step 4).
