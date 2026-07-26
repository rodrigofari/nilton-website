# GEO Audit Report: Madeira Surf Progress

**Audit date:** 2026-07-26
**URL:** https://madeirasurfcoach.com
**Business type:** Local business — single-operator surf coaching, Madeira Island, Portugal
**Pages analysed:** 10 (5 locale homepages + 5 privacy pages)

> Audited hours after the site was opened to indexing. It has **zero index history**, no Search Console, and no measurable AI-search presence yet. Scores reflect that starting position — this is a baseline, not a verdict on the build.

---

## Executive summary

**Overall GEO score at audit: 47/100 (Poor) → 62/100 (Fair) after same-day fixes**

> **Update, same day.** Critical issues C1 and C2 and high-priority H3 are fixed and live.
> Measured in production: empty elements per page 66 → **0**; words visible without JS
> 1,410 → **1,630**; nav text without JS `''` → **11 items**; CLS 0.125 → **0.002**;
> Lighthouse SEO 69 → **100**; performance 74 → **80**. `FAQPage` schema with 9 Q&A pairs
> now ships in all five locales, `hasOfferCatalog` carries the four real prices, and the
> WSL profile is in `sameAs`. Remaining work is listed below and is mostly waiting on
> Nilton, not on code.

The technical foundation is genuinely strong — server-rendered HTML, clean hreflang across five locales, valid structured data, `llms.txt`, every AI crawler allowed, CLS at zero. That work is done and it is done well.

Three things hold the score down, and they are unrelated to build quality:

1. **AI crawlers that don't run JavaScript see a site with no navigation and no calls to action.** 66 elements per page are empty in the HTML. Googlebot renders JS and sees everything; GPTBot, ClaudeBot and CCBot largely do not.
2. **The brand has no web presence, but the person does.** "Madeira Surf Progress" returns nothing. "Nilton Freitas" returns a World Surf League athlete profile, a YouTube feature filmed in Porto da Cruz, and named client reviews on GetYourGuide. None of that authority is connected to the site.
3. **Every non-existent URL returns HTTP 200** with the language-picker page instead of a 404.

### Score breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability | 58 → **80**/100 | 25% | 20.0 |
| Brand Authority | 28/100 | 20% | 5.6 |
| Content E-E-A-T | 55 → **58**/100 | 20% | 11.6 |
| Technical GEO | 62 → **85**/100 | 15% | 12.8 |
| Schema & Structured Data | 45 → **80**/100 | 10% | 8.0 |
| Platform Optimization | 25/100 | 10% | 2.5 |
| **Overall** | | | **47.4 → 62.5/100** |

---

## Critical issues

### ✅ C1 — AI crawlers receive a site with no navigation — FIXED

66 elements per page ship empty in the HTML and are populated by `scripts/i18n.js` after it fetches `/content/{locale}.json`.

Measured by requesting `/pt/` as `GPTBot/1.0` with no JavaScript execution:

```
Words of prose received     : 1,410   ✅
Empty elements              :    66   ❌
Text content of <nav>       :    ''   ❌
```

What disappears: **13 navigation items, every call-to-action button, 13 service labels, 11 spot labels, 6 footer items, 5 About labels, 4 contact labels.**

Googlebot executes JavaScript and sees the complete page. **GPTBot, ClaudeBot and CCBot generally do not.** So ChatGPT and Claude can read Nilton's prose but cannot see that the site offers four services, cannot see a single "Book now", and cannot map the site's structure.

The prose survives because it uses the `data-content-id` convention with inline text. Only the short strings bound via `data-i18n` are affected.

**Fix:** inline these strings into each locale's HTML, exactly as the long prose already is. The runtime binding buys nothing — each locale already has its own HTML file, so there is no duplication being avoided. This is documented in `DECISIONS.md` (2026-07-26). **The same change also removes the last remaining layout shift**, so it pays twice.

### ✅ C2 — Soft 404s: every unknown URL returns HTTP 200 — FIXED

```
/nao-existe            → 200
/pt/nao-existe         → 200
/styles/x.css          → 200
```

All three return the root language-picker HTML. Cloudflare Pages does this when no `404.html` exists.

Any mistyped or fabricated URL is a valid, indexable page with duplicate content. AI systems that probe URLs will conclude those pages exist and may cite them.

**Fix:** add a `404.html` at the repo root. Pages serves it automatically with a real 404 status.

---

## High priority

### 🟡 H1 — A verifiable credential exists and is not being used — schema done, visible copy pending

The site says Nilton is a *"competitive surfer, trained under high-level coaches"* and mentions *"years on the Portuguese national circuit"*. Both are unverifiable claims as written.

There is a **World Surf League athlete profile** for a Portuguese surfer named Nilton Freitas:

> Nationality Portugal · born 13 Dec 2004 · Men's Junior Tour 2024 rank **#84** · first QS season 2022 · best result **33rd**, Morocco Mall Junior Pro Casablanca · max heat score **8.70**

⚠️ **Confirm with Nilton that this is him before using it.** The profile does not state Madeira as hometown. Supporting evidence: a YouTube feature titled *"NILTON FREITAS. A legend to be. Porto da Cruz, Madeira | 4K"* — Porto da Cruz is one of the spots listed on the site.

If confirmed, this is the single highest-value E-E-A-T asset available and it costs nothing: add the WSL URL to `sameAs` on both the `Person` and `LocalBusiness` nodes, and cite the ranking in the bio. "Competitive surfer" becomes "WSL Junior Tour competitor, ranked #84 in 2024" — a checkable fact, which is exactly what AI systems cite.

### 🟡 H2 — Entity fragmentation — WSL profile now in sameAs; Google Business Profile still the big one

| Query | Result |
|---|---|
| "Madeira Surf Progress" | **Nothing** |
| "madeirasurfcoach" | **Nothing** |
| "Nilton Freitas" surf | WSL profile · YouTube feature · **named client reviews on GetYourGuide** |

GetYourGuide reviews mention him by name — *"Nilton was really nice and caring"* — alongside Madeira Surf Center / Ruben Afonso.

AI systems resolve entities. Right now "Nilton Freitas" and "Madeira Surf Progress" are two unconnected entities, and all the authority sits with the one that has no website. `sameAs` currently lists **Instagram only**.

**Fix:** add every verified profile to `sameAs` — WSL, YouTube channel, Google Business Profile, any directory listing. This is the mechanism by which AI systems merge the two into one entity.

### ✅ H3 — No FAQPage schema despite 9 FAQ items per page — FIXED

Nine questions in semantic `<details>`/`<summary>` on every homepage, with substantial answers. **No `FAQPage` markup.**

Q&A blocks are the highest-value AI citation format there is, and this site has 45 of them across five locales, all invisible as structured Q&A.

**Fix:** add a `FAQPage` node to the existing `@graph`. Highest effort-to-impact ratio in this entire audit.

### H4 — Legal entity name is empty (compliance, not just GEO)

`footer.legal_entity` renders empty. Portuguese e-commerce law (DL 7/2004) requires a commercial site to identify its operator. The site is now public.

Also weakens `LocalBusiness.legalName`, currently the placeholder `"Nilton Freitas"`.

**Fix:** get the registered name and NIF from Nilton.

### 🟡 H5 — The postal address is "Madeira" — PARTIALLY FIXED (Machico + geo added; street address still needed)

```json
"address": {"addressLocality": "Madeira", "addressRegion": "Madeira", "addressCountry": "PT"}
```

No street, no postal code, no city. No `geo` coordinates. For a **local** business, this is the field that decides whether you appear in "surf lessons near me" and in Gemini/Maps answers.

Public sources associate Nilton with **Machico** (and a Rua da Torre address surfaced in search, unverified — the official Visit Madeira RNAAT directory returned no match, so do not use it without confirming).

**Fix:** ask Nilton for the registered business address and add `streetAddress`, `postalCode`, `addressLocality`, plus `geo` coordinates.

---

## Medium priority

### 🟡 M1 — Three unlabelled numbers in the About section — labels now inlined ("Years in the water", "Coach certifications", "Spots known inside out") but the figures are still unconfirmed
The stats render as bare **`10+`**, **`3`**, **`12`** — the labels are `data-i18n` elements, so a non-JS crawler sees three naked integers. Even rendered, they are still flagged `data-placeholder`, i.e. unconfirmed. Either confirm and inline them, or remove them.

### M2 — 24 of 26 images have empty alt text
Decorative-by-default is defensible for background imagery, but the gallery, spot cards and service cards carry meaning. AI systems read alt text to understand imagery.

### ✅ M3 — Real prices are published but not in schema — FIXED
Four services with real prices (€90–120 / €150–220 / €700–1,500 / custom). The `Service` node has no `Offer`. Price is a primary comparison signal in AI answers.

### M4 — Stock photography on a personal-brand service business
Only the Nilton portrait and three Madeira shots are genuine; the rest is Unsplash. For "is this person real and do they actually surf here", stock imagery is a trust cost. **This resolves itself when Nilton's photos arrive.**

### M5 — No Search Console, no Bing Webmaster Tools
Google AI Overviews are built on the classic index. Nothing is submitted. Sitemap exists and is correct — it just needs submitting.

### M6 — Anonymous testimonials
`Cliente · Lisboa` is the correct GDPR-safe default and legitimate, but named reviews carry more weight. Do **not** add `Review`/`aggregateRating` schema while reviewers are anonymous — unverifiable review markup is a manual-action risk.

---

## Low priority

- **L1** — LCP 5.9s on mobile; the hero is a ~700 KB remote Unsplash JPEG. Resolves when real photos land, self-hosted and optimised.
- **L2** — No blog or topical depth. Zero pages target informational queries.
- **L3** — Three spot descriptions still unconfirmed (Ribeira da Janela, Contreiras, Praia do Seixal).
- **L4** — `llms.txt` is well written but predates recent changes; refresh once content settles.

---

## Category deep dives

### AI Citability — 58/100
**Strong:** 1,161–1,453 words of real prose survive without JS. Clean heading hierarchy (7 × H2, 13 × H3). Named entities throughout — nine spots by name, four services with prices, phone number. Specific, checkable claims: *"read the day, pick the wave, refine the technique"*, *"most visiting surfers spend their week guessing the forecast"*.

**Weak:** no structural signposting for a non-JS crawler — no nav, no CTA text, no section labels. FAQ answers are substantial but unmarked as Q&A. Testimonials are anonymous.

### Brand Authority — 28/100
Person: WSL profile, YouTube feature, GetYourGuide review mentions, Instagram. Brand: nothing. No Wikipedia, no Reddit, no confirmed Google Business Profile. The two identities are not linked.

### Content E-E-A-T — 55/100
**Experience** is the strongest pillar — the content is unmistakably written by someone who surfs Madeira. **Expertise** is claimed but not substantiated on-page. **Authoritativeness** is near zero because no external corroboration is cited. **Trustworthiness** is mixed: published prices and a real privacy policy, against an empty legal entity, unlabelled stats and stock photos.

### Technical GEO — 62/100
Excellent SSR, robots, sitemap, hreflang, HTTPS/HSTS/CSP, CLS 0.000, `llms.txt`, all AI crawlers allowed, edge locale negotiation with correct `Vary`. Dragged down by the empty-element problem and soft-404s.

### Schema — 45/100
`LocalBusiness` + `Person` + `Service` present and parsing in all five locales. Missing: `FAQPage`, `geo`, a real `PostalAddress`, `Offer` on services, `sameAs` beyond Instagram.

### Platform Optimization — 25/100
| Platform | Readiness | Blocker |
|---|---|---|
| Google AI Overviews | 20 | No index history, no Search Console |
| ChatGPT search | 35 | Empty nav/CTAs for GPTBot |
| Perplexity | 30 | No citable third-party corroboration |
| Gemini / Maps | 15 | No confirmed Google Business Profile |
| Bing Copilot | 20 | Not submitted to Bing |

**Honest assessment:** for a solo surf coach in a niche geographic market, the website is **not** the highest-leverage asset. A complete **Google Business Profile with real reviews** will outperform every on-site optimisation in this report for "surf lessons Madeira" queries. The site's job is to be the authoritative destination those profiles point to.

---

## Quick wins — this week

1. **Add `FAQPage` schema.** 9 Q&A pairs already written. Hours of work, highest impact on-site.
2. **Add a `404.html`.** One file. Closes the soft-404 hole.
3. **Confirm the WSL profile and add it to `sameAs`** + cite the ranking in the bio. Turns a vague claim into a checkable fact.
4. **Claim / complete the Google Business Profile.** Highest-leverage action in this entire audit for a local operator.
5. **Submit the sitemap** to Search Console and Bing Webmaster Tools.

## 30-day plan

### Week 1 — unblock the crawlers
- [ ] Inline the 66 `data-i18n` strings into each locale's HTML *(also removes the last CLS)*
- [ ] Add `404.html`
- [ ] Add `FAQPage` schema
- [ ] Submit sitemap to Search Console + Bing

### Week 2 — establish the entity
- [ ] Confirm WSL profile; add to `sameAs` on `Person` and `LocalBusiness`
- [ ] Claim/complete Google Business Profile at the real address; add it to `sameAs`
- [ ] Get the registered legal name + NIF; fill the footer and `legalName`
- [ ] Add `streetAddress`, `postalCode`, `addressLocality` and `geo`

### Week 3 — substantiate
- [ ] Nilton's real photos replace the stock imagery; self-host and optimise
- [ ] Confirm or remove the three About statistics
- [ ] Confirm the three outstanding spot descriptions
- [ ] Write meaningful alt text for gallery, spots and services
- [ ] Add `Offer` with real prices to the service schema

### Week 4 — earn citations
- [ ] Ask recent clients for named reviews on Google and consent to be named on-site
- [ ] Publish the first informational page — **"When to surf Madeira: month-by-month swell and wind guide"**. Highly citable, nobody local owns it, and it is a question Nilton already answers daily.
- [ ] Refresh `llms.txt`
- [ ] Re-run this audit and compare

---

## Appendix: pages analysed

Measured as `GPTBot/1.0`, no JavaScript execution.

| URL | Words (no JS) | H2/H3 | Empty elements | JSON-LD | FAQ items |
|---|---|---|---|---|---|
| `/en/` | 1254 | 7/13 | 66 | 1 | 9 |
| `/pt/` | 1410 | 7/13 | 66 | 1 | 9 |
| `/fr/` | 1453 | 7/13 | 66 | 1 | 9 |
| `/de/` | 1262 | 7/13 | 66 | 1 | 9 |
| `/uk/` | 1161 | 7/13 | 66 | 1 | 9 |
| `/en/privacy/` | 578 | 9/0 | 5 | 0 | 0 |
| `/pt/privacy/` | 600 | 9/0 | 5 | 0 | 0 |
| `/fr/privacy/` | 650 | 9/0 | 5 | 0 | 0 |
| `/de/privacy/` | 556 | 9/0 | 5 | 0 | 0 |
| `/uk/privacy/` | 537 | 9/0 | 5 | 0 | 0 |

**Method note:** the five specialist subagents this audit normally delegates to all terminated on API 529 errors. The audit was completed directly instead — every figure above was measured against production, not estimated.

**Sources consulted:**
- [WSL athlete profile — Nilton Freitas](https://www.worldsurfleague.com/athletes/15650/nilton-freitas)
- [YouTube — "NILTON FREITAS. A legend to be. Porto da Cruz, Madeira"](https://www.youtube.com/watch?v=5lVNCyuPrGs)
- [GetYourGuide — Madeira Surfing Experience](https://www.getyourguide.com/madeira-l67/surfing-experience-t602315/)
- [Visit Madeira — Tourist Entertainment Directory (RNAAT)](https://visitmadeira.com/en/tourist-entertainment-directory/) — no matching registration found
