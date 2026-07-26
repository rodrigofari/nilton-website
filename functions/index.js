/* Locale negotiation for `/` — Cloudflare Pages Function.
 *
 * This logic used to live in `_redirects` as `Language=` conditions. That is
 * Netlify syntax: Cloudflare Pages only understands `from to [status]`, so
 * every one of those lines was discarded as malformed and all traffic fell
 * through to the final `/  /en/  302`. Portuguese, French, German and
 * Ukrainian visitors all silently landed on English — no error, no warning.
 *
 * Functions take precedence over static assets, so this owns `/`. The static
 * root index.html language picker remains as the no-JS fallback for contexts
 * where Functions don't run (local `python -m http.server`, direct asset hits).
 */

const DEFAULT_LOCALE = "en";

/* Base language -> locale folder. Regional variants (pt-BR, de-AT, fr-CA, …)
 * collapse to their base tag, so only base tags need listing here. */
const BASE_TO_LOCALE = { en: "en", pt: "pt", fr: "fr", de: "de", uk: "uk" };

export function pickLocale(header) {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map(part => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map(p => p.trim())
        .filter(p => p.startsWith("q="))
        .map(p => Number.parseFloat(p.slice(2)))[0];
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    /* q=0 means "explicitly not acceptable" — drop these rather than let them
     * rank last and still win when nothing else matches. */
    .filter(entry => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag === "*") break; // wildcard = no preference; stop and use default
    const base = tag.split("-")[0];
    if (BASE_TO_LOCALE[base]) return BASE_TO_LOCALE[base];
  }
  return DEFAULT_LOCALE;
}

export function onRequest({ request }) {
  const locale = pickLocale(request.headers.get("Accept-Language"));

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${locale}/`,

      /* Without Vary, a shared cache could hand one visitor's negotiated
       * redirect to the next visitor with a different language. Accept-Language
       * has enormous cardinality so caching this is pointless anyway — no-store
       * removes the ambiguity entirely. */
      "Vary": "Accept-Language",
      "Cache-Control": "no-store",

      /* `_headers` applies to static assets, NOT to Function responses, so the
       * headers that still matter on a redirect are repeated here. */
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
