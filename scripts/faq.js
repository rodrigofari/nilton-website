/* FAQ enhancement — native <details>/<summary> handle keyboard +
 * a11y by default. This module mirrors aria-expanded for screen
 * readers that don't track <details> open state, and that's it. */

export function enhance(detailsEl) {
  if (!detailsEl || detailsEl.dataset.faqEnhanced) return;
  detailsEl.dataset.faqEnhanced = "true";

  const summary = detailsEl.querySelector("summary");
  if (!summary) return;

  const sync = () => summary.setAttribute("aria-expanded", String(detailsEl.open));
  sync();
  detailsEl.addEventListener("toggle", sync);
}
