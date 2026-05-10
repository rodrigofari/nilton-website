# Architectural Decisions

Log of non-obvious choices. New entries go at the top with date and rationale. Don't log obvious decisions ("we use HTML for HTML pages") — only the ones a future reader would otherwise reverse-engineer or second-guess.

---

## 2026-05-09 — `data-placeholder="true"` marks unconfirmed content

Any HTML element rendering placeholder content (mockup service cards, sample testimonials, draft spot descriptions, stand-in stats) carries the attribute `data-placeholder="true"`. Pre-launch QA is a single grep.

**Why:** Placeholder copy is unavoidable while waiting on client confirmation. Without a marker, real and stand-in content become indistinguishable in review and risk shipping. A data attribute (rather than a CSS class or comment) keeps the marker semantic, invisible to users, and removable without touching styles.

**How to apply:**
- Mark every placeholder element: service cards, testimonial quotes + author names, spot descriptions, sample stats, lorem-ipsum sections.
- Pre-launch checklist: `grep -r 'data-placeholder' .` must return zero hits before deploy.
- Don't mark structural placeholders (e.g. an empty `<picture>` waiting for a real image) — those are tracked via `assets/images/MANIFEST.md` instead.

---

## 2026-05-10 — Single logo across all surfaces. Compromise at small sizes is accepted.

The brand mark is the same `logo-256.png` (with srcset to `logo-512.png` for retina) on every surface — nav (40×40 on cream), footer (64×64 on dark navy), favicon (16/32/48), apple-touch-icon (180×180), OG cards (~460×460 on navy). **No per-surface logo variants.** No knockout version, no monogram extraction, no contextual plates, no badge crops.

**Why not variants:**
- The logo is an illustrated lockup with cream + navy + gold elements. Each surface's bg colour suppresses ~30% of those elements (cream parts blend on cream nav; navy parts blend on dark footer).
- Programmatic colour-shift variants (Pillow-generated knockouts and navy-only silhouettes) were prototyped on 2026-05-10. They worked mechanically but didn't solve the underlying problem — the logo's *design* is the issue at small sizes, not the colour palette. Re-colouring doesn't add resolution.
- A per-surface variant set requires a designer to author. Programmatic versions look automated. Premium positioning is undermined by automated-looking marks more than by mild contrast loss.
- The mitigations (plates, crops, monogram-only nav) all introduce visual weight or strip recognisable character. Cost > benefit for a brand-new site.

**The accepted trade-off:**
- At 40×40 nav-size against cream, the logo reads as a small dark silhouette of the badge. Wordmark text inside the logo is illegible at that size — it's not meant to be read; it's meant to register as "the brand mark for this site."
- At 64×64 footer-size against dark navy, the cream wave foam + gold "SURF PROGRESS" elements are visible. Navy elements blend. Same compromise inverted.
- Both are visually acceptable in their slots when paired with the live "Madeira Surf Progress" wordmark text alongside (nav) or above (footer).

**One mitigation we did keep:**
- `filter: drop-shadow(0 1px 2px rgba(15, 35, 64, 0.12))` on `.site-nav__brand-mark`. Subtle navy-tinted edge shadow that lifts the logo against cream surfaces. Invisible against navy (navy-on-navy = no-op), so the same rule covers nav and footer.
- Rejected mitigations (logged for posterity so they don't get re-tried): contextual contrast plates behind the logo, processed knockout variants, badge crops, single-tone silhouettes.

**How to apply:**
- New surfaces use the same `logo-{256,512,1200,2400}.png` set with srcset chosen by display size.
- If a future surface has bg colour that destroys the logo's contrast badly (e.g. a yellow surface), reach for a designer-authored variant — don't re-attempt programmatic variants.
- When a designer ships proper light-on-dark / dark-on-light / monogram variants, swap path is one filename change per surface (nav → variant for cream; footer → variant for navy). HTML structure stays identical.

---

## 2026-05-10 — Logo is raster (transparent PNG) until designer ships an SVG

The brand mark currently lives as a set of transparent PNGs at `assets/images/logos/`:
- `logo-master-1254.png` (master, 1254×1254)
- `logo-2400.png` (OG cards, high-DPI surfaces)
- `logo-1200.png` (footer, large surfaces)
- `logo-512.png` (favicon source, medium surfaces)
- `logo-256.png` (nav-mark @ 1x; 512 used for @2x retina)

All are 8-bit RGBA with true alpha transparency, processed from the original JPEG the client provided. The cream background that the JPEG had has been removed; logos composite cleanly on any colour surface (navy footer, cream nav, etc.).

**Why raster, not SVG:**
- Original deliverable was JPEG. No vector source file exists yet.
- The illustrated badge style (cliffs, surfer, sun, birds, multiple text layers) is detail-heavy enough that a hand-traced SVG would either lose fidelity or balloon in file size.
- At the rendering sizes we use (40px nav, 64px footer, 180px apple-touch-icon, 460px OG), the PNG raster set is visually indistinguishable from a hypothetical SVG.

**Future swap path (single pass when SVG arrives):**
1. Drop the SVG into `assets/images/logos/logo.svg`
2. Update `.site-nav__brand-mark` references in HTML across 12 files: change `<img>` to `<img>` pointing to `.svg` instead of `.png`, drop the srcset
3. Regenerate favicon set from SVG (Pillow + cairosvg, or external tool)
4. Re-render OG cards using the SVG-rasterised logo as source
5. Delete the PNG set if the SVG covers all sizes cleanly

**How to apply:**
- Don't add new code paths that assume vector logo. The current setup is the canonical state.
- If retina concerns ever bite (4K monitors), bump the srcset's `2x` to use `logo-1200.png` instead of `logo-512.png` — already in the asset folder.
- The `apple-touch-icon.png` is 180×180 — Apple's spec. Don't resize it, generate fresh from `logo-512.png` if the source ever changes.

---

## 2026-05-10 — Brand name and legal entity are intentionally distinct

The commercial brand is **"Madeira Surf Progress"** (premium coaching positioning, what the public sees and books). The legal entity is **Nilton Freitas's registered surf school in Portugal** (regulatory shell — Portuguese licensing under IPDJ / tourism authority requires this category for anyone operating commercially as a surf instructor).

The two coexist by design. Don't merge them. Don't "fix" the apparent contradiction.

**Where the brand appears (public-facing):**
- Nav and footer wordmark
- Page `<title>`, OG/Twitter titles
- Schema.org `LocalBusiness.name`
- llms.txt header
- Hero, marketing copy, all client-facing surfaces

**Where the legal entity appears (small print / regulatory disclosure):**
- Footer legal small print (one-line disclosure under the rights line)
- Privacy policy "Who runs this site" section
- Schema.org `LocalBusiness.legalName`
- Eventually: terms of service page (when one exists)
- Eventually: any invoice/contract surface

**Why this pattern is correct, not weird:** Boutique service businesses commonly have a legal shell that names a regulatory category while the commercial brand names a positioning. A wine bar registered as a "restaurant" because licensing demands it. A creative agency registered as "marketing services LLC" while branded as something else. Same here — Portuguese surf-instruction licensing requires "surf school" categorization. The brand "Madeira Surf Progress" markets premium coaching; the legal entity "[Nilton's registered name] — Surf School" satisfies IPDJ requirements. Both true simultaneously.

**The logo's "SURF SCHOOL · MADEIRA ISLAND, PORTUGAL" tagline is regulatory disclosure**, not a positioning contradiction. Earlier flagged as an issue — that flag was wrong. Logo stays as-is.

**How to apply:**
- New JSON keys `meta.brand_name`, `meta.legal_name`, `footer.legal_entity` exist as the canonical references.
- `meta.legal_name` is currently set to placeholder `"Nilton Freitas"` (sole-proprietor default). Real registered name from Nilton replaces it pre-launch — content swap, not architectural change.
- `footer.legal_entity` is the disclosure sentence; carries `data-placeholder="true"` on the rendered element until Nilton confirms the legal name + license number to insert.
- JSON-LD `LocalBusiness.legalName` mirrors `meta.legal_name`. JSON-LD `LocalBusiness.additionalType` is set to `https://schema.org/SportsActivityLocation` to give Google an explicit sports-activity hint alongside the LocalBusiness shell.
- Don't move legal disclosure into the prominent footer brand area. It's deliberately small-print.

---

## 2026-05-09 — Cloudflare Pages, not GitHub Pages. Site assumes root-domain serving.

The site is deployed to Cloudflare Pages (`nilton-website.pages.dev`, eventually a custom domain). GitHub Pages is **not** a viable target for this codebase as-shipped.

**Why:**
- Every absolute path in the HTML/CSS/JS uses leading `/` (e.g. `/styles/main.css`, `/en/`, `/scripts/main.js`, `fetch(\`/content/${locale}.json\`)`). 100+ references.
- These resolve from the domain root.
- **GitHub Pages serves project repos at a subpath** (`https://USERNAME.github.io/REPO/`) — absolute paths 404 there. The site loads HTML; nothing else loads.
- **Cloudflare Pages serves at the subdomain root** (`https://PROJECT.pages.dev`) — absolute paths resolve correctly.
- **`_redirects` and `_headers` are Cloudflare-specific** — GitHub Pages ignores both, so edge-side locale auto-routing and CSP enforcement disappear there.

**How to apply:**
- If anyone ever wants to deploy to GitHub Pages, they need either: (a) a build step that rewrites every absolute path to include the subpath prefix, (b) a custom domain wired at the GitHub Pages root, or (c) renaming the repo to `USERNAME.github.io` (which serves at root). All three are workarounds, not improvements.
- Custom-domain DNS in Cloudflare is one-click from the Pages dashboard — no separate provider needed.
- Don't introduce relative paths "for portability" — they make resolution context-dependent (`/en/privacy/index.html` referencing `/styles/main.css` would need a different path than `/index.html`). The absolute-path convention is intentional and right for this hosting target.

---

## 2026-05-09 — Short fixed labels live in JSON, not inline. Migrate retroactively.

Any inline text that's actually a single-word label, fixed kicker, or short repeated UI string belongs in `content/*.json` keyed under the appropriate section, not hard-coded in HTML — even when discovered after-the-fact.

**The rule:** if a string is (a) under ~20 characters, (b) doesn't change with context, and (c) appears in multiple cards/sections, it's microcopy. Microcopy goes to JSON. Long prose stays in HTML.

**Why:** Mixing labels into inline HTML breaks the editing model. To change "Service" → "Surf Service" today means touching 5 HTML files (one per locale, three cards each = 15 occurrences). With `data-i18n="services.eyebrow"`, it's one JSON value per locale (5 changes total). The content split rule was already established but not enforced — this entry codifies the audit + retroactive migration.

**Migrated 2026-05-09:**
- `services.eyebrow` ("Service" / "Serviço" / "Service" / "Angebot" / "Послуга") — was inline `<span class="card__eyebrow">…</span>` × 3 cards × 5 locales = 15 occurrences. Now one JSON key, bound via `data-i18n`.

**Audit candidates flagged for future migration (not blocking 4b):**
- **`/{locale}/privacy/` "Back to home" link label** — currently inline as `← Back to home` (EN) / will need translation in PT/FR/DE/UK privacy pages. Strong candidate for `nav.back_to_home`. Will migrate when building the locale privacy pages so it lands JSON-bound from the start.
- **Service card-eyebrow context note:** the `<span>` is empty (text supplied by JS at render). `data-placeholder="true"` markers stay on the card root, so pre-launch grep still catches them.

**Items that look like labels but stay inline (deliberate):**
- Spot-card tag values (`Advanced`, `Intermediate+`, `Beginner`, `NW–W`, `X–III`, etc.) — these are *per-spot data*, not labels. They live next to spot descriptions and follow the same content-id pattern logically. Migrating them to JSON would create 6 spots × 4 tag values × 5 locales = 120 keys for data that varies per spot. Wrong tool.
- Card prices (`€80`, `€280`, `From €650`) — same reasoning. Per-card data.
- "Sample Reviewer" testimonial author placeholders — will be replaced with real names when real testimonials arrive. Placeholder text marked via `data-placeholder="true"` on the testimonial root.

**How to apply:**
- New labels go to JSON immediately, never inline.
- During code review, anyone seeing a hardcoded short string in HTML should check if it'd appear in 2+ locales. If yes, migrate.
- Pre-launch grep gate: scan production HTML for inline eyebrows: `grep -rn '<span class="card__eyebrow">[A-Za-z]' --include="*.html" --exclude="styleguide.html"`. Zero hits expected. `styleguide.html` is documentation; demo strings there are intentional.

---

## 2026-05-09 — `data-content-id` is the canonical address for inline prose

Every block of inline prose (hero headline, bio paragraphs, FAQ Q&As, spot descriptions, testimonials, contact lede, privacy sections) carries a stable `data-content-id` attribute. The same ID lives in all five locale files at the same content position — only the inner text differs by language.

**Format:** `section.subsection.element` — flat, dot-separated.

**Examples:**
- `hero.headline`, `hero.lede`
- `about.h2`, `about.bio.p1`, `about.bio.p2`, `about.bio.p3`
- `services.guided.title`, `services.guided.desc`, `services.coaching.desc`, `services.trip.desc`
- `spots.jardim.desc`, `spots.paul.desc`, `spots.ponta-pequena.desc`, `spots.faja-da-areia.desc`, `spots.porto-da-cruz.desc`, `spots.machico.desc`
- `testimonials.1.quote`, `testimonials.1.city` … through `.3`
- `faq.1.q`, `faq.1.a` … through `faq.7.q`, `faq.7.a`
- `contact.lede`
- `privacy.intro`, `privacy.disclaimer`, `privacy.who-runs.body`, `privacy.collect.intro`, etc.

**Why:** Inline prose has no JSON address. Without a canonical ID, "change the about bio paragraph 2 across all five locales" requires visual hunting through five files in five languages — error-prone, especially for editors who don't read all five. With IDs, the operation becomes a targeted find-and-replace by attribute.

**How to apply:**
- New prose blocks must get a `data-content-id` before being added to any locale file.
- IDs are stable. Once an ID is assigned, don't rename it — the cross-locale binding breaks.
- IDs are content addresses, not runtime concerns. `i18n.js` doesn't read them; SEO doesn't care; Lighthouse ignores them. They exist purely for editing tooling.
- When adding a new section, allocate the ID prefix in this DECISIONS entry first so it stays canonical.

---

## 2026-05-09 — Testimonial city labels: localize per language

Testimonial city names use the locale's natural exonym, not the English form:
- **PT-PT:** Lisboa, Berlim, Paris
- **FR:** Lisbonne, Berlin, Paris
- **DE:** Lissabon, Berlin, Paris
- **UK:** Лісабон, Берлін, Париж
- **EN:** Lisbon, Berlin, Paris

**Why:** Cities have established exonyms in each language. Forcing the English form everywhere reads as Anglophone-imposed and breaks the locale's natural register. Different from the glossary rule (which preserves brand-relevant Madeiran place names like `Madeira`, `Jardim do Mar`, `Paul do Mar`) — those *are* the brand.

**How to apply:**
- City labels are wrapped in `<span data-content-id="testimonials.{N}.city">` so they're addressable separately from the quote.
- New testimonials follow the same pattern.

---

## 2026-05-09 — PT-PT spelling: post-AO90 (modern reform)

Portuguese translations use the post-2009 *Acordo Ortográfico* spellings, which are the standard in Portuguese government and media since the reform.

**Use:** `atual`, `atualização`, `proteção`, `exceto`, `ação`, `direção`, `objeto`, `aspeto`.
**Don't use:** `actual`, `actualização`, `protecção`, `excepto`, `acção`, `direcção`, `objecto`, `aspecto`.

**Why:** The reform is mandatory in Portuguese government and media; modern PT-PT readers expect post-AO90 spellings. Pre-reform spellings read as either dated or as a stylistic choice the brand isn't making.

**How to apply:**
- Translation passes (Claude or human) must produce post-AO90 spellings by default.
- Find/replace pre-deploy if a translation slips through with old spellings: `actualiz` → `atualiz`, `protecç` → `proteç`, `exc[ep]ç` → `exceç`, etc.

---

## 2026-05-09 — EN CTAs use Title Case; other locales follow their language convention

All English call-to-action labels are **Title Case**: `Book Now`, `See Services`, `Plan Your Session`, `Book This`, `Message on WhatsApp`. Short prepositions (`on`, `in`, `to`, `for`) stay lowercase per AP/Chicago rules.

PT-PT, FR, DE, UK keep their language's natural case convention:
- **PT-PT:** sentence case where it reads naturally (`Reservar`, `Planeia a tua sessão`, `Ver serviços`, `Reservar`)
- **FR:** sentence case (`Réserver`, `Planifie ta session`, `Voir les services`)
- **DE:** sentence case with German noun-capitalization rule (`Jetzt buchen`, `Plane deine Session`, `Angebote ansehen`)
- **UK:** single-word imperatives are lowercase except sentence-initial (`Забронювати`, `Сплануй сесію`)

**Why:** Title case is the EN convention for premium/editorial CTAs — sentence case ("See services") looks under-considered next to "Book Now" and breaks the visual rhythm. Other languages have their own conventions; forcing title case onto them would read as Anglophone-imposed and slightly off.

**How to apply:**
- New EN CTA labels go through Title Case before landing in JSON.
- Don't impose Title Case on PT/FR/DE/UK during translation — translator (human or Claude) follows the language's convention.
- Body copy is sentence case in all locales. Title Case only applies to button labels and short CTA-style links.

---

## 2026-05-09 — `backdrop-filter` is desktop-only on `.site-nav`

The sticky nav uses `backdrop-filter: saturate(140%) blur(16px)` for the glassy effect. This is **scoped to `@media (min-width: 769px)`** and never applied at mobile. At mobile, the nav uses a solid translucent fill (`rgba(244, 239, 231, 0.92)`) with no blur.

**Why:** Per CSS spec, `backdrop-filter` creates a new containing block for `position: fixed` descendants — same as `transform`, `filter`, `perspective`. A `position: fixed` mobile drawer that's a descendant of an element with `backdrop-filter` doesn't escape to the viewport — it's trapped inside the ancestor's box. Symptom: the drawer renders as a tiny clipped panel attached to the nav bar instead of full-height side drawer.

This was caught when the mobile drawer rendered as ~300×120 dropdown attached to the hamburger button, showing only the first nav link, with no backdrop visible.

**How to apply:**
- If anyone adds `backdrop-filter`, `transform`, `filter`, `perspective`, or `will-change` to an ancestor of a `position: fixed` element, the fixed element will be trapped. The drawer's expected behavior is "fixed relative to viewport" — protect that.
- Mobile loses the glassy nav, but mobile + sticky + blur is rarely worth the cost (also impacts perf on lower-end devices). The visual loss is negligible — solid translucent reads cleanly against any hero photo.
- If we ever genuinely want the blur effect at mobile, the drawer must be moved OUT of `<header>` in the DOM (e.g. portaled to `<body>` via JS) to escape the containing-block trap.

---

## 2026-05-09 — Madeira break-type vocabulary: no "reef breaks"

Madeira's surf spots are **point breaks**, **rock breaks**, and **beach breaks** — never reef breaks. The volcanic geology produces basalt boulder/rock bottoms and sand+pebble beaches, not coral or true reef formations.

**Why:** Caught during review. Calling Jardim, Paul, or Ponta Pequena "reef breaks" is factually wrong and reads as outsider copy to anyone who actually surfs the island. Madeira surfers and surf media do not use the term.

**Spot-type mapping for translations and any future copy:**
- **Point breaks** — Jardim do Mar, Ponta Pequena, often Paul do Mar
- **Rock breaks** — Paul do Mar (the heavier characterization)
- **Beach breaks** — Fajã da Areia, Porto da Cruz (sand + pebble)
- **Bays** — Machico (sheltered, sandy bottom, beginner-friendly)

**How to apply:**
- Don't reintroduce "reef" / "récif" / "Riff" / "риф" during 4b translation passes. Pre-launch grep `grep -ri 'reef\|récif\|riff\|риф' content/ */index.html` must return zero hits.
- If we ever need a generic term covering point + rock + beach, use "the island's breaks" — neutral, accurate.

---

## 2026-05-09 — Cream text never sits on terracotta. Token-level contrast constraint.

Cream (`#FFFEFA` / `--color-ink-on-dark`) on terracotta (`--color-accent` `#C66B3D`) is ~2.9:1 — below WCAG AA (4.5:1 for normal text, 3:1 for non-text). Forbidden as a foreground/background pair.

The fix is structural, not per-component:
- **Default state on terracotta:** text is dark navy (`--color-ink-strong`), ~5.5:1 ✓ AA.
- **Hover state on terracotta-strong** (`--color-accent-strong`, darker): cream text is acceptable, ~5.8:1 ✓ AA.
- **Cream on terracotta is reserved for hover/active states only**, where the bg has darkened to terracotta-strong.

**Why:** Caught when "Book Now" hover text appeared to disappear on review. Cream-on-terracotta was visually "there" but unreadable on most monitors. Token-level rule prevents future button variants or accent surfaces from re-introducing the problem.

**How to apply:**
- Any new component that sits on `--color-accent` (terracotta) uses `--color-ink-strong` as its text color by default.
- Cream-on-accent is permitted only when bg is `--color-accent-strong` or darker.
- This includes icons (FAB icon followed the same rule — navy icon on terracotta, cream icon on accent-strong hover).
- If a future design tweak makes terracotta lighter, re-audit. The rule is "AA contrast against the actual rendered terracotta," not "navy is sacred."

---

## 2026-05-09 — Spot "best season" rendered as Roman numerals (e.g. X–III)

The "Best season" tag on each spot card uses Roman numeral month ranges (`X–III`, `V–IX`, `I–XII`), not localized "Oct–Mar" / "Out–Mar" / etc.

**Why:**
- Translating month abbreviations across 5 locales would mean either 60 new JSON keys (5 locales × 12 months) or per-spot translated season keys (30 keys). For a value that appears in a tag, that's heavy.
- Roman numerals are universal — every locale renders them identically.
- They read as a small editorial / insider detail, which fits the Clean & Premium tone.

**How to apply:**
- Format: `X–III` (en-dash, not hyphen). Capital Romans I–XII for months 1–12.
- Wraps allowed across two lines if needed; tag CSS already permits.

---

## 2026-05-09 — Honor Global Privacy Control (GPC) as automatic decline

If `navigator.globalPrivacyControl === true` on page load, `consent.js` writes `"declined"` to `localStorage[CONSENT_KEY]` immediately and never shows the banner. No GA, no further prompts.

**Why:**
- GPC is a legally-recognized consent signal in some jurisdictions (e.g. California CCPA explicitly; EU treatment is evolving but several DPAs have endorsed it).
- Cheaper to ship correct than to defend a half-implementation if it ever becomes a complaint.
- DNT is *not* honored — it's silence, not an explicit decline. GPC is explicit.

**How to apply:**
- Two lines at the top of `initConsent()`. Set localStorage and return early.
- If a user with GPC later disables it, they get the banner on next visit (localStorage already has `"declined"`, so they won't — acceptable; they can manually clear storage).
- Don't add a UI to "override GPC" — that would defeat the purpose.

---

## 2026-05-09 — Loud missing-key fallback in i18n

When `i18n.js` can't resolve a `data-i18n` key, it sets the element's text content to `[key.path]` literally **and** sets `data-missing="true"` on the element. A single CSS rule in `utilities.css` makes any `[data-missing="true"]` element red with a red outline.

**Why:**
- Locale rollout (4b) will produce missing keys if PT/FR/DE/UK get out of sync with EN. Silent fallback to English would mask the bug; blank text would mask it visually.
- A red, outlined, bracketed key in production is impossible to miss. We catch sync errors before users do.

**How to apply:**
- Pre-launch QA gate: `grep -r 'data-missing' .` must return zero hits in source. (Won't catch runtime-set hits — also visually inspect the rendered page in all 5 locales.)
- Don't suppress the CSS rule "for production" — it's the safety net. Any missing key in prod is a bug worth seeing red.

---

## 2026-05-09 — FAQ prose lives in HTML per locale, accepted 5-file diff cost

FAQ questions and answers are inline in each locale's `index.html`, not extracted to JSON. Same rule as all other prose per the content-split decision.

**Why:**
- FAQ answers are multi-sentence rich text. JSON escaping for paragraphs is ugly.
- The cost: editing or adding a Q&A means touching 5 HTML files.
- The benefit: translators (or Claude in our workflow) see structure and context together. No JSON-escape mistakes.

**How to apply:**
- Accept the 5-file edit cost. It's bounded — there's only ever one site, only ever 5 locales.
- If FAQ ever grows past ~12 items or starts versioning often, revisit. Until then, the rule holds.
- Microcopy *labels* (`expand`, `collapse` aria-labels) stay in JSON.

---

## 2026-05-09 — Hero uses real Unsplash surf photo; all other 32 image slots stay Picsum

The hero image (`hero/hero-desktop` and `hero/hero-mobile`) renders a real Unsplash surf photo during review. The other 32 image slots in `MANIFEST.md` stay on `picsum.photos`.

**Why:**
- Hero is the first impression on every page review. A generic Picsum landscape there undermines design confidence and leads to spurious "but the site doesn't feel like a surf site" feedback.
- The other 32 slots staying Picsum keeps the "we don't have real photos yet" signal loud — reviewers won't critique imagery that's about to be replaced.
- Pre-launch grep gate still catches Picsum URLs (32 hits) so this doesn't slip through.

**How to apply:**
- Hero `<img>` and `<source>` elements use Unsplash URLs (with `?w=` and `&fit=crop` params for stable dimensions).
- The hero Unsplash URL is documented in `assets/images/MANIFEST.md` so it's swappable when Nilton's real hero shot arrives.
- Composition: wide Madeira coastline or paddle-out, no recognizable face.

---

## 2026-05-09 — Design direction: Clean & Premium (editorial), not Sporty & Bold

The site ships in an editorial / premium register. Fraunces (variable, optical-sized) for display; Inter for body. Warm sand base, atlantic deep navy ink, terracotta + gold accents. Generous whitespace. Restrained motion. Small or pill radii — never the 8–12px "default modern web" radius.

**Why:**
- **Audience match.** Madeira's tourism brand is premium/editorial, not action-sports. Visit Madeira and the island's actual visitor profile skews higher-spend, multi-activity travelers who surf as one part of a Madeira trip. The site needs to read as an option for that traveler, not as a teen-shred destination.
- **Commercial positioning.** Nilton is selling himself as "trusted local guide," not "extreme charger." Editorial premium sells the discernment narrative; sporty sells the intensity narrative. The first converts higher-margin bookings.
- **Aging.** Editorial restraint dates slowly. Bold athletic design dates fast — peaks of trend visibility every 3–5 years.
- **Competitive gap.** Most Madeira surf schools and guides ship Sporty/Bold. Editorial premium is uncontested positioning in the local competitive set.

**How to apply:**
- No pure `#000` / `#FFF` anywhere — both reserved as conceptual extremes that we always pull away from.
- Type scale 1.250 (major third). Display sizes lean large with tracking-tight; body keeps comfortable line-height (~1.6).
- Spacing scale generous, not dense. Premium feel comes partly from whitespace discipline.
- Radii: 2px / 4px / pill. No 8px, 12px, 16px.
- Motion: 200–500ms with `cubic-bezier(.2, .8, .2, 1)` family. No bouncy, no spring, no overshoot.
- Shadows soft and warm-tinted (navy alpha), used sparingly.
- If Sporty/Bold elements creep in during build (high-saturation accents, heavy display weights, tight grids), pull back. The brand is restraint.

---

## 2026-05-09 — Spot name canonical form: "Paul do Mar" (no accent), and local-form-wins rule

The spot is locked as **"Paul do Mar"** without the accent, across every locale (including PT-PT), every surface (spots section, glossary, JSON-LD, alt text, SEO copy, future content), forever. European Portuguese orthography would normally write `Paúl`, but the local community and surf media use the unaccented form. That's what the brand uses.

**Why:** We're representing a Madeiran surf guide, not running a Portuguese language textbook. When formal orthography and local usage diverge, **local form wins.** Search behavior matches this — surfers and travelers Google `Paul do Mar`, not `Paúl do Mar`.

**How to apply:**
- Don't "correct" `Paul` to `Paúl` during future translation passes, including PT-PT. This is the rule that PT-PT translators (human or Claude) will reflexively want to break.
- Same principle applies to any other place name where local usage diverges from formal orthography. The brand follows what the community actually says/writes.
- If you ever need to render the formally-correct form (e.g. an academic citation), do it explicitly — never as a default.

---

## 2026-05-09 — Translation glossary: terms preserved untranslated

Across all locales (PT, FR, DE, UK):
- **Place names:** Madeira, Machico, Jardim do Mar, **Paul do Mar** (no accent — see lock entry below), Ponta Pequena, Fajã da Areia, Porto da Cruz, Lugar de Baixo
- **Proper nouns:** Nilton Freitas, Ludens Clube de Machico
- **Surf terms (English is international standard):** lineup, peak, point break, paddle out, swell
- **Brand names:** WhatsApp, Instagram, Facebook

**Why:** Place names anchor the brand to Madeira and match what Google/Apple Maps return. Surf terms are international jargon — translating "swell" to "houle"/"Dünung"/"ondulação" reads as amateur to surfers. Brand names are non-negotiable.

**How to apply:**
- Even in Cyrillic-script locales (Ukrainian), these terms stay in Latin script. Mixed-script lines like "острів Madeira, Portugal" are correct, not a bug.
- If a glossary term has a fully naturalized equivalent in a target language that surfers actually use, it can translate — but the default is preserve.
- Country names not on the list (Portugal, France, Germany) follow normal translation conventions, with one exception: when adjacent to a glossary place name, prefer Latin script for visual consistency (`острів Madeira, Portugal` not `острів Madeira, Португалія`).

---

## 2026-05-09 — PT-PT register: `tu`, not `você`

Portuguese translations address the reader as `tu` (informal 2nd-person singular), not `você` or formal constructions.

**Why:** Personal-brand surf guide, Madeiran voice, young-adult traveler audience. `tu` matches the casual, direct register Madeirans use in informal contexts and reads as natural rather than corporate. `você` would feel either Brazilian or stiffly formal.

**How to apply:**
- All imperatives: `Reserva` not `Reserve`, `Confirma` not `Confirme`, `Planeia` not `Planeje`.
- Subjunctive after `até`: `até aceitares` not `até aceitar`/`até você aceitar`.
- Pronouns: `te`, `ti`, `tua/teu`.
- Easy to flip later if Nilton wants more formal — it's a search-and-replace pass on `pt.json` plus a `_meta.last_updated` bump.

---

## 2026-05-09 — `/privacy/` page in scope, one per locale

A simple privacy policy page lives at `/{locale}/privacy/` for each of the 5 locales. EU-standard template, drafted in EN and translated via the Claude pipeline. Listed in `sitemap.xml`. Linked from the footer and from the consent banner's `policy_link`.

**Why:** The consent banner's privacy link must resolve to a real document for GDPR compliance. Hosting it in-repo keeps the translation pipeline uniform across all site copy.

**How to apply:**
- Pages ship alongside step 4 (HTML skeleton + i18n plumbing).
- Standard sections: data we collect (anonymous GA4), cookies, retention, contact, jurisdiction (Portugal).

---

## 2026-05-09 — Consent: deny-by-default, opt-in

EU-correct: GA4 stays uninitialized until the user explicitly accepts. No cookies set before consent. No tracking pixels load before consent.

**Why:** GDPR requires affirmative consent. Pre-checked boxes and "by using this site you accept" patterns are non-compliant under EDPB guidance.

**How to apply:**
- Banner shows on first visit per locale. Choices persist via a single `localStorage` key (`consent.v1` = `"accepted" | "declined"`).
- Decline state is also persistent — don't re-show the banner on every page load after a decline.

---

## 2026-05-09 — `LocalBusiness` schema: appointment-driven, no opening hours

JSON-LD `LocalBusiness` ships without `openingHours`. Address is `addressLocality: "Madeira"`, `addressRegion: "Madeira"`, `addressCountry: "PT"` — no street. `priceRange: "€€"`.

**Why:** Nilton operates by appointment and the schedule is forecast-driven (sessions only run when the swell is right). Publishing fixed hours would mislead — Google could surface "Open now" when there's no surf, or "Closed" on a perfect day. Better to omit the field than lie. Street address omitted because there is no fixed studio/shop — guiding happens at whichever spot is firing.

**How to apply:**
- Don't add `openingHours` "for completeness" — its absence is the correct signal.
- If we ever add a fixed studio location, revisit this entry.

---

## 2026-05-09 — GA4 Measurement ID is a placeholder until launch

`scripts/config.js` ships with `GA_ID = "G-XXXXXXXXXX"`. Real ID is swapped in before deploy.

**Why:** No GA4 property exists yet for the client. Building consent + analytics flows against a placeholder is fine — the wiring is the same, only the ID changes.

**How to apply:**
- Pre-deploy checklist must include "swap GA_ID in `scripts/config.js`".
- A real ID matches `^G-[A-Z0-9]{10}$`. The placeholder is intentionally invalid so a forgotten swap is visible in DevTools (GA4 will reject it).

---

## 2026-05-09 — Services section ships with mockup placeholder packages

Three placeholder packages from the mockups: **Guided Session €80**, **Coaching Intensive €280**, **Surf Trip €650**. Each card is marked in the HTML with `data-placeholder="true"` so a project-wide search surfaces every placeholder card when Nilton confirms real services.

**Why:** Service descriptions and pricing are pending from the client, but the section needs visual content for the design review and for navigation testing. Marking with a data attribute (rather than a JSON field) keeps it co-located with the prose, since service descriptions live in HTML per our content split.

**How to apply:**
- Every placeholder service card carries `data-placeholder="true"`.
- Pre-launch checklist: `grep -r 'data-placeholder' .` must return zero hits before deploy.
- Same convention for any other placeholder content (testimonials, spot descriptions).

---

## 2026-05-09 — Translation workflow: Claude-driven, not external

PT source content is fed into a Claude conversation, which produces EN/FR/DE/UK back. Files are dropped into the repo by overwriting the empty-string scaffolds.

**Why:** No external translator vendor, no client self-service for non-PT locales. Claude handles the translation work directly.

**How to apply:**
- Empty-string scaffolds in `pt.json` / `fr.json` / `de.json` / `uk.json` are still correct — Claude fills empty strings, structure stays intact.
- Every locale file carries a `_meta` block (`locale`, `direction`, `last_updated`, `translator`) so we can spot stale or mixed-source translations later. `translator` enum: `claude`, `human`, `client`.
- When a translation pass runs, bump `_meta.last_updated` to the ISO date of the pass.

---

## 2026-05-09 — Portuguese is European Portuguese (PT-PT) only

Brazilian Portuguese is out of scope. URL stays short at `/pt/` (not `/pt-pt/`); the BCP-47 distinction lives in `<html lang="pt-PT">`, `hreflang="pt-PT"`, and `_meta.locale: "pt-PT"`.

**Why:** Nilton is Madeiran. Tone and vocabulary must match European register. PT-BR vocabulary in his voice would read as inauthentic to the audience he serves (European travelers booking Madeira surf trips).

**How to apply:**
- Vocabulary cues for PT-PT: `telemóvel` not `celular`, `casa de banho` not `banheiro`, `autocarro` not `ônibus`, `fixe` not `legal`, `pequeno-almoço` not `café da manhã`, `comboio` not `trem`, `ementa` not `cardápio`.
- Grammar cues: 2nd-person plural `vocês` is fine; avoid PT-BR gerund constructions (`estou fazendo` → use `estou a fazer` for PT-PT).
- If we ever add other regional variants (`en-US` vs `en-GB`, `de-DE` vs `de-AT`), apply the same pattern: short URL, full BCP-47 in lang/hreflang/_meta. Not in scope today.

---

## 2026-05-09 — Ukrainian locale code is `uk`, not `ua`

ISO 639-1 code for the Ukrainian language is **`uk`**. `ua` is the ISO 3166-1 country code for Ukraine — wrong layer.

**Why:** Common mistake. Using `ua` in `<html lang>`, `hreflang`, or URL paths produces invalid markup that crawlers and screen readers will mishandle. A real bug, not a stylistic preference.

**How to apply:**
- URL: `/uk/`
- `<html lang="uk">`
- `hreflang="uk"`
- File: `content/uk.json`
- If a regional variant is ever needed (extremely unlikely for this site), it's `uk-UA`.

---

## 2026-05-09 — Strict CSP from day one

No inline scripts, no inline styles, ever. External files or nonces only.

**Why:** Tightening CSP later means rewriting half the JS once inline patterns have crept in. Cheaper to forbid them now than to refactor later.

**How to apply:**
- Future embed needs (Instagram, GetYourGuide, etc.) are `connect-src` / `frame-src` additions only — not relaxations of `script-src` or `style-src`.

---

## 2026-05-09 — Locale resolution at the edge, not in JS

Root `/` redirects to a locale via Cloudflare `_redirects` reading `Accept-Language`. JS-based redirects are not used.

**Why:** JS redirects land crawlers and screen readers on a blank shell. Edge redirects return localized HTML on first byte — better SEO, better a11y, faster perceived load.

**How to apply:**
- `index.html` at root is a no-JS fallback with a manual language picker — only seen if `_redirects` doesn't fire (local dev, edge cases).

---

## 2026-05-09 — `styleguide.html` noindex is layered, not via robots.txt Disallow

`robots.txt` **allows** `/styleguide.html`. Noindex is enforced via `<meta name="robots">` + `X-Robots-Tag` header.

**Why:** `Disallow` in robots.txt prevents crawlers from fetching the page, which means they never see the meta tag — and the URL can still get indexed without content if linked externally. The correct combination is "allow crawl + tell crawler not to index."

**How to apply:**
- Robots.txt: no Disallow for `/styleguide.html`.
- HTML: `<meta name="robots" content="noindex, nofollow">`.
- `_headers`: `X-Robots-Tag: noindex, nofollow` for `/styleguide.html`.

---

## 2026-05-09 — Content split: short strings in JSON, prose in HTML

Short UI strings (nav, buttons, labels, errors) live in `content/{locale}.json`. Long prose (hero copy, about bio, FAQ answers) lives directly in each locale's `index.html`.

**Why:** Rich text in JSON requires escaping (quotes, line breaks, optional emphasis tags) which makes it painful to edit and review. HTML keeps prose readable and lets translators see structure.

**How to apply:**
- New strings under ~80 chars and used as labels/CTAs/microcopy → JSON.
- Multi-sentence paragraphs, FAQ answers, bio → HTML, with the locale's HTML file owning its own copy.

---

## 2026-05-09 — `{year}` token in footer rights string, no general templating

`footer.rights` contains the literal token `{year}`. The i18n binder substitutes `new Date().getFullYear()` at render time. No other tokens, no general substitution system.

**Why:** The copyright year is the only value on the site that should auto-update. Hardcoding it means someone touches the repo every January; using a full templating engine for one substitution is overkill.

**How to apply:**
- Translators must preserve the literal `{year}` substring in every locale's `footer.rights`.
- If a second dynamic value ever appears, add it as a named token (`{phone}`, `{email}`) — but reconsider before introducing a third. More than two tokens means we should write the binder properly, not keep stacking string replaces.

---

## 2026-05-09 — No ICU MessageFormat, no runtime pluralization

All strings are static. If a number ever needs to vary, hard-code both forms as separate keys.

**Why:** Marketing site, not an app. Variable counts ("3 sessions") aren't in the domain. Adding pluralization machinery now is YAGNI.
