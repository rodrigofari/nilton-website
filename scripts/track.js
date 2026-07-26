/* Interaction tracking — GA4 custom events.
 *
 * ---------------------------------------------------------------------------
 * Consent
 * ---------------------------------------------------------------------------
 * track() is a no-op until window.gtag exists, and analytics.js only loads
 * gtag after the visitor accepts the banner. A visitor who declines, or who
 * has not answered yet, produces no events at all.
 *
 * Interactions that happen BEFORE the visitor accepts are dropped, not queued.
 * Queueing them and flushing on accept would mean collecting behaviour from a
 * window in which there was no permission to collect it. The lost events are
 * the price of that being true.
 *
 * ---------------------------------------------------------------------------
 * Why nothing here is hardcoded per locale
 * ---------------------------------------------------------------------------
 * Identifiers are derived from the site's existing `data-content-id`
 * convention (`services.coaching.title`, `faq.3.q`, `spots.jardim.desc`),
 * which is identical across all five locale pages. So `service=coaching` means
 * the same thing whether the visitor is on /pt/ or /uk/, and none of the five
 * HTML files needed editing to add tracking. Change a class name or a
 * content-id and tracking follows it; there is no parallel list to keep in
 * sync.
 *
 * ---------------------------------------------------------------------------
 * Custom dimensions
 * ---------------------------------------------------------------------------
 * Event parameters are collected but INVISIBLE in GA4 reports until each one
 * is registered as a custom dimension (Admin -> Custom definitions). The
 * registered list lives in DECISIONS.md. Adding a parameter here without
 * registering it there means silently collecting data nobody can read.
 */

import { $$, on } from "./dom.js";

/* ---------------------------------------------------------------- core --- */

function pageLocale() {
  // <html lang> is "pt-PT" on /pt/ but the folder — and the useful grouping —
  // is "pt". GA4 already collects the visitor's browser language separately.
  return (document.documentElement.lang || "en").split("-")[0];
}

export function track(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, { page_locale: pageLocale(), ...params });
}

/* ------------------------------------------------------- cta resolution --- */

/* Which of the ten WhatsApp buttons was this? Ordered most-specific first:
 * the drawer CTA is inside .site-nav, and service cards are inside sections,
 * so a looser order would collapse distinct buttons into one bucket. */
function ctaLocation(el) {
  if (el.closest(".floating-cta")) return "fab";
  if (el.closest(".site-nav__list")) return "nav_drawer";
  if (el.closest(".site-nav")) return "nav";
  if (el.closest(".hero")) return "hero";
  if (el.closest(".card")) return "service_card";
  if (el.closest("#contact")) return "contact";
  if (el.closest("#about")) return "about";
  return "other";
}

/* `services.coaching.title` -> `coaching`. Undefined outside a service card. */
function serviceId(el) {
  const card = el.closest(".card");
  const titled = card && card.querySelector('[data-content-id^="services."]');
  return titled ? titled.dataset.contentId.split(".")[1] : undefined;
}

/* Deliberately NOT sending a price band. The prices live in the content and
 * are edited there; a copy in JS would drift silently the first time Nilton
 * changes one, and a wrong price band is worse than none. `service` is stable
 * and the price for each is a lookup a human can do once. */

/* ------------------------------------------------------------ wiring --- */

function trackWhatsApp() {
  // Delegated: the FAB and drawer CTAs exist at load, but delegation also
  // survives any future markup that injects CTAs.
  on(document, "click", e => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;
    track("whatsapp_click", {
      cta_location: ctaLocation(link),
      service: serviceId(link) || "none",
    });
  });
}

function trackSections() {
  const sections = $$("main section[id]");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  // rootMargin band rather than a threshold: sections here are taller than the
  // viewport on mobile, so "35% of the section is visible" can never become
  // true. Crossing the middle of the screen always can.
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      track("section_view", { section: entry.target.id });
      io.unobserve(entry.target); // once per page view, not once per scroll
    }
  }, { rootMargin: "-30% 0px -30% 0px" });

  for (const s of sections) io.observe(s);
}

function trackSpots() {
  // Spots sit in a horizontal scroller, so "which ones did they scroll to"
  // is a real signal — unlike the services grid, where everything is on screen.
  const cards = $$('#spots [data-content-id$=".desc"]')
    .map(el => el.closest(".card"))
    .filter(Boolean);
  if (!cards.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const desc = entry.target.querySelector('[data-content-id$=".desc"]');
      track("spot_view", { spot_name: desc.dataset.contentId.split(".")[1] });
      io.unobserve(entry.target);
    }
  }, { threshold: 0.6 });

  for (const c of cards) io.observe(c);
}

function trackFaq() {
  // Capture phase: `toggle` does not bubble.
  on(document, "toggle", e => {
    const item = e.target.closest(".faq__item");
    if (!item || !item.open) return; // opening only — closing is not a signal
    const summary = item.querySelector("[data-content-id]");
    if (!summary) return;
    // `faq.3.q` -> `faq_3`, so the number survives as a readable label.
    track("faq_open", { question_id: "faq_" + summary.dataset.contentId.split(".")[1] });
  }, true);
}

function trackGallery() {
  const items = $$(".gallery__item");
  if (!items.length) return;
  on(document, "click", e => {
    const item = e.target.closest(".gallery__item");
    if (!item) return;
    track("gallery_open", { image_index: items.indexOf(item) + 1 });
  });
}

function trackLanguageSwitch() {
  on(document, "click", e => {
    const opt = e.target.closest(".lang-switcher__option");
    if (!opt || !opt.dataset.locale) return;
    if (opt.dataset.locale === pageLocale()) return; // re-picking the current one
    track("language_switch", {
      from_locale: pageLocale(),
      to_locale: opt.dataset.locale,
      // This link navigates away; sendBeacon is the only transport that
      // reliably survives the unload.
      transport_type: "beacon",
    });
  });
}

function trackConsent() {
  // Only "accepted" is ever recordable — a decline must not phone home, which
  // is the whole point of the decline. So this measures "accepted in this
  // session" and says nothing about the decline rate. To size the gap, compare
  // GA4 sessions against Cloudflare Web Analytics (cookieless, server-side,
  // counts everyone). See DECISIONS.md.
  window.addEventListener("consent:accepted", () => {
    // Fires after analytics.js has loaded gtag, so the event lands.
    setTimeout(() => track("consent_decision", { decision: "accepted" }), 0);
  });
}

export function initTracking() {
  trackWhatsApp();
  trackSections();
  trackSpots();
  trackFaq();
  trackGallery();
  trackLanguageSwitch();
  trackConsent();
}
