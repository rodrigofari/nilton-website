/* Constants only. No logic. Values that change between
 * environments live here so swapping is one file. */

export const WHATSAPP_NUMBER = "351966236416";

/* GA4 Measurement ID — live.
 * Property "Madeira Surf Progress" (538432132), web stream for
 * madeirasurfcoach.com, under the "Nilton Freitas" account.
 *
 * Loaded only by scripts/analytics.js, and only after the visitor accepts
 * the consent banner. Do NOT paste GA's "install manually" inline snippet
 * into the HTML: the CSP has no 'unsafe-inline', so it would be blocked,
 * and it would fire before consent. The ID here is all that's needed. */
export const GA_ID = "G-V04S12TKNE";

export const LOCALES = ["en", "pt", "fr", "de", "uk"];
export const DEFAULT_LOCALE = "en";

export const CONSENT_KEY = "consent.v1";
export const LANG_KEY = "lang.preferred";
