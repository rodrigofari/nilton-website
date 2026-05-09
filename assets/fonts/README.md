# Self-hosted fonts

The CSS in `styles/base.css` references these woff2 files. They're not committed to the repo (binary blobs); drop them here before deploy. Production CSS will load them with no further changes.

## Required files

| File | Source | Subsets needed |
|---|---|---|
| `Fraunces-Variable.woff2` | [Google Fonts — Fraunces](https://fonts.google.com/specimen/Fraunces) variable, upright | latin, latin-ext |
| `Fraunces-Variable-Italic.woff2` | Google Fonts — Fraunces variable, italic | latin, latin-ext |
| `Inter-Variable.woff2` | [Google Fonts — Inter](https://fonts.google.com/specimen/Inter) variable, upright | latin, latin-ext, **cyrillic, cyrillic-ext** |
| `Inter-Variable-Italic.woff2` | Google Fonts — Inter variable, italic | latin, latin-ext, **cyrillic, cyrillic-ext** |

**Cyrillic subsets are required for Inter** — the UK locale (Ukrainian) must not fall back to system fonts mid-page. Don't ship Inter with Latin-only subsets.

## How to download (one-shot)

The simplest path is the [google-webfonts-helper](https://gwfh.mranftl.com/fonts) tool:

1. Search "Fraunces" → select variable → check Latin + Latin Extended → "Modern" preset → download.
2. Search "Inter" → select variable → check Latin + Latin Extended + **Cyrillic + Cyrillic Extended** → "Modern" preset → download.
3. Repeat for italic variants of both faces.

Rename the downloaded files to match the four filenames listed above and place them in this folder.

## Verification

Once placed, open `/styleguide.html` in a browser. Display headings should render in Fraunces (high-contrast serif with optical sizing); body text in Inter. If they look like Times New Roman / system sans, the files aren't loading — check filenames and paths.

DevTools network tab should show all four woff2 fetches as 200 OK with `font/woff2` content-type. Total payload should be under ~250 KB across the four variable fonts.

## Why self-hosted, not Google Fonts CDN

Two reasons, both in `DECISIONS.md`:

1. **Performance.** First-byte serving from our own origin removes a DNS lookup + TLS handshake.
2. **GDPR.** Fetching from `fonts.googleapis.com` sends the visitor's IP to Google. EU jurisprudence (e.g. the 2022 LG München ruling) treats this as a data transfer requiring consent. Self-hosting sidesteps the issue entirely.
