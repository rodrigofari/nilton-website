# Madeira Surf Progress: Build Plan

Marketing site for Nilton Freitas, surf guide in Madeira, Portugal. Single page per locale, drives bookings via WhatsApp.

## Live state (2026-07-25)
- **Brand:** Madeira Surf Progress (commercial). Legal entity: Nilton Freitas, licensed surf school (Portuguese IPDJ regulatory category). See DECISIONS for the brand-vs-legal-entity rationale.
- **Repo:** https://github.com/rodrigofari/nilton-website
- **Preview deploy:** https://nilton-website.pages.dev — Cloudflare Pages, auto-deploys on push to `main`
- **Production domain:** **madeirasurfcoach.com** — bought 2026-07-25, registrar + DNS both Cloudflare, same account as the Pages project. Zone was empty at purchase (no A/AAAA/CNAME/MX/TXT), so nothing to preserve. **Not yet wired to Pages** — see "Wiring the production domain" below.
- **Indexing:** soft-launch gate active. `_headers` sends `X-Robots-Tag: noindex, nofollow` on `/*` until the placeholder content is replaced. One line to remove; the removal gate is documented in `_headers` itself.
- **Status:** Build complete (4a + 4b + 4c). Phase 1 brand pivot shipped. Phase 2 (content rewrite for new positioning) in progress. Domain swap + self-hosted fonts landed 2026-07-25.

## Brand / domain naming — open decision

The domain is `madeirasurfcoach.com`; the brand in the content is "Madeira Surf Progress".
The rename pass below was written before the domain was bought and assumed the name
`madeira-surf-progress`. **Reconfirm before renaming anything** — the choice is either to
align the repo/project names to the domain (`madeira-surf-coach`) or to keep the brand
name and accept that the domain differs. Neither breaks anything; three different names
would be the bad outcome.

1. **Repo** `rodrigofari/nilton-website` → chosen name (GitHub Settings → Rename; old URL auto-redirects)
2. **Cloudflare Pages project** `nilton-website` → chosen name (Pages dashboard → Settings)

~~3. Hardcoded `niltonfreitas.surf` → real domain~~ — **done 2026-07-25.** 153 occurrences
across 15 site-serving files (canonical, hreflang, sitemap, robots, llms.txt, schema).

## Wiring the production domain (Cloudflare, ~10 min)

Registrar and Pages are in the same Cloudflare account, so DNS + cert are automatic:

1. **Workers & Pages → `nilton-website` → Custom domains → Set up a domain** → `madeirasurfcoach.com`. Cloudflare creates the CNAME (apex flattening) and issues the certificate.
2. Repeat for `www.madeirasurfcoach.com`.
3. **Canonical host is the apex** — all content is written apex-shaped. Add **Rules → Redirect Rules**: `www` → apex, 301.
4. **SSL/TLS → Overview → Full (strict).** Not Flexible/Automatic — those cause a redirect loop against Pages.
5. **SSL/TLS → Edge Certificates → Always Use HTTPS: On.**
6. **Email:** MX is empty. If Nilton wants `nilton@madeirasurfcoach.com`, Cloudflare Email Routing is free. Either way add **SPF + DMARC** (`v=spf1 -all`, `p=reject`) so nobody can spoof mail from the domain.
7. Leave **"Block AI training bots: Do not block"** as-is (we want AI-search visibility), and do **not** enable Cloudflare's managed robots.txt / Content Signals Policy — the repo serves its own `robots.txt`.

⚠️ `_headers` already sends HSTS `max-age=31536000; includeSubDomains; preload`. Keep the
header, but **do not submit the domain to the HSTS preload list** until the subdomain
structure is settled — preload is slow and painful to reverse.

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
├── README.md                   # public-facing project overview (renders on GitHub repo home)
├── PLAN.md                     # this file — build state + open items
├── DECISIONS.md                # log of non-obvious architectural choices
├── .gitignore                  # ignores .claude/, .DS_Store, translation-pack-*, .env, etc.
│
├── index.html                  # root: no-JS language picker fallback
├── _redirects                  # Cloudflare Pages: Accept-Language → /{locale}/
├── _headers                    # Cloudflare Pages: strict CSP, HSTS, cache rules
├── robots.txt
├── sitemap.xml                 # 5 homepages + 5 privacy pages, hreflang × 5 + x-default
├── llms.txt                    # AI-crawler summary
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
```

All files in the tree above are committed and live. No queued items remain in the build sequence.

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
5. **Repo + deploy** ✅ shipped
   - GitHub repo created and initial commit pushed: `rodrigofari/nilton-website`
   - `.gitignore` covers `.claude/`, `.DS_Store`, `translation-pack-*.md`, `.env`, etc.
   - `README.md` written — describes stack, structure, locale model, pre-deploy checklist
   - Cloudflare Pages connected to GitHub repo, framework preset `None`, no build command, output `/`
   - First production build green; preview live at `nilton-website.pages.dev`
   - Auto-deploy on every push to `main` (typically ~30s build)
6. **Pre-deploy items for production launch** — see below; awaits client deliverables (woff2 fonts, real GA4 ID, real photos, finalized copy)

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

## Pre-deploy items still outstanding (for production launch)

The site is live at the preview URL but these need to land before pointing the production domain:

**Client-side deliverables (waiting on Nilton):**
- [ ] **Real photos** — replaces 32 Picsum URLs + 1 Unsplash hero (per `assets/images/MANIFEST.md` slot specs)
- [ ] **Service descriptions** confirmed — currently 3 placeholder cards marked `data-placeholder="true"`
- [ ] **About bio** confirmed — current draft is placeholder, marked `data-placeholder="true"`
- [ ] **FAQ answers** confirmed — 7 working drafts, all marked placeholder
- [ ] **Real testimonials** collected — 3 sample quotes marked placeholder
- [ ] **Brand approval** of design direction (Clean & Premium) and copy tone

**Technical deliverables (build-side):**
- [x] **Domain swap** — `niltonfreitas.surf` → `madeirasurfcoach.com`, 153 occurrences, 15 files (2026-07-25)
- [x] **woff2 fonts** built and committed to `/assets/fonts/` — Fraunces variable + italic, Inter variable + italic with Cyrillic. Subset from upstream variable TTFs; see `assets/fonts/README.md` for the build and for the known Fraunces-has-no-Cyrillic issue on `/uk/`. (2026-07-25)
- [x] **Real GA4 Measurement ID** in `scripts/config.js` — `G-V04S12TKNE`, property "Madeira Surf Progress" (538432132), web stream 15324365830 for `https://madeirasurfcoach.com`. Enhanced measurement on, including **outbound clicks** — the closest proxy this site has to a booking, since every CTA is a `wa.me` link. (2026-07-25)
- [x] **CSP widened for GA4's EU endpoint** — `region1.google-analytics.com`. Verified end-to-end under the real CSP in headless Chrome: with the old exact-host rule `gtag.js` loaded fine but every `/g/collect` hit was CSP-blocked, so GA4 would have reported zero traffic with no visible error.

**Two GA4 dashboard warnings that are expected and should be ignored:**
"Sua tag do Google não foi detectada" and "A coleta de dados não está ativa". Google's
detector fetches the page as an anonymous bot; it never accepts the consent banner, and
`scripts/analytics.js` only loads gtag after acceptance. So the tag is undetectable *by
design* and these warnings will persist permanently. Verify with DevTools → Network →
filter `collect` after clicking Accept, or GA4 Realtime — not with the tag detector.
- [ ] **Remove the soft-launch `X-Robots-Tag: noindex` line** from `_headers` — last step before public launch, gated on the QA greps below

**Pre-deploy QA gates (must all return zero hits):**
- [ ] `grep -rn 'picsum.photos' . --include="*.html"` (currently 105 across 5 locales — all by design, swap with real images)
- [ ] `grep -rn 'data-placeholder' . --include="*.html"` (currently ~75 — all by design, replace with confirmed copy)
- [ ] `grep -rn 'Sample Reviewer' . --include="*.html"` (currently 15 — fake social proof, must not ship publicly)
- [ ] `grep -rn 'data-missing' . --include="*.html"` ✅ already 0
- [ ] `grep -ri 'reef\|récif\|riff\|риф' content/ */index.html` ✅ already 0
- [ ] Production HTML eyebrow gate: `grep -rn '<span class="card__eyebrow">[A-Za-z]' --include="*.html" --exclude="styleguide.html"` ✅ already 0

**Production launch (post-Nilton-deliverables):**
- [ ] **Custom domain** wired in Cloudflare Pages (Add custom domain → DNS auto-provisioned)
- [ ] **Manually verify** all 5 locale homepages and 5 privacy pages render cleanly with real content
- [ ] **Lighthouse pass** ≥ 95 on Performance, Accessibility, Best Practices, SEO (will be achievable once fonts + photos are in)

## Decision log
Detailed rationale for non-obvious choices lives in `DECISIONS.md` (created in step 4).
