import { initI18n } from "./i18n.js";
import { initNav } from "./nav.js";
import { initLangSwitcher } from "./lang-switcher.js";
import { initConsent, getConsent } from "./consent.js";
import { initFloatingCta } from "./floating-cta.js";
import { initTracking } from "./track.js";

async function init() {
  await initI18n();
  initNav();
  initLangSwitcher();
  initConsent();
  initFloatingCta();

  // Interaction tracking. Listeners attach for every visitor, but track() is
  // inert until gtag exists, which only happens post-consent. Attaching now
  // rather than on the consent event means someone who accepts mid-scroll is
  // measured from that moment without the page needing to be re-armed.
  initTracking();

  // Analytics — load post-consent (eager if already accepted, lazy on event)
  if (getConsent() === "accepted") {
    import("./analytics.js").then(m => m.initAnalytics());
  }
  window.addEventListener("consent:accepted", () => {
    import("./analytics.js").then(m => m.initAnalytics());
  });

  // Gallery — lazy on first item click
  document.addEventListener("click", e => {
    const trigger = e.target.closest(".gallery__item");
    if (!trigger) return;
    e.preventDefault();
    import("./gallery.js").then(m => m.openLightbox(e));
  });

  // FAQ — lazy on first toggle
  document.addEventListener("toggle", e => {
    const item = e.target.closest(".faq__item");
    if (!item) return;
    import("./faq.js").then(m => m.enhance(item));
  }, true);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
